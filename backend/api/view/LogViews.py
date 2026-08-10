from datetime import date
from django.utils import timezone
from django.db.models import Func, Value, CharField
from django.db.models.functions import Coalesce
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models import EstimateLogsModel
from zoneinfo import ZoneInfo

class ToChar(Func):
    function = 'to_char'
    output_field = CharField()


class UpsertVisitedLogsView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data

        current_date = timezone.now().date()
        first_day_of_month = date(current_date.year, current_date.month, 1)
        
        try:
            input_user = data['user']
            input_login = data['login']
            input_frc = data['frc']
            input_is_revenue = data.get('is_revenue', False)
            print(f"{input_user}, {input_frc}")
        except KeyError as e:
            return Response(
                {'error': f'Missing required field: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        current_month_start = date.today().replace(day=1)

        try:
            log_entry, created = EstimateLogsModel.objects.using('fin').update_or_create(
                login=input_login,
                frc=input_frc,
                is_revenue=input_is_revenue,
                estimate_date=first_day_of_month,
                defaults={
                    'last_visited': timezone.now(), 
                },
                create_defaults={
                    'user': input_user,              
                    'last_visited': timezone.now(),
                }
            )

            if created:
                return Response({
                    'status': 'created',
                    'id': log_entry.id,
                    'message': 'New line successfully added to table.'
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response({
                    'status': 'updated',
                    'id': log_entry.id,
                    'message': 'Existing record constraint matched. last_visited timestamp updated.'
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Database error encountered: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class UpsertUpdatedLogsView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        
        try:
            input_user = data['user']
            input_login = data['login']
            input_frc = data['frc']
            input_is_revenue = data.get('is_revenue', False)
            incoming_save_values = data['save_values'] 
        except KeyError as e:
            return Response(
                {'error': f'Missing required field: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(incoming_save_values, list):
            return Response(
                {'error': 'save_values must be a JSON array/list of objects.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Match the database monthly constraint
        current_month_start = date.today().replace(day=1)
        now_timestamp = timezone.now()

        try:
            log_entry = EstimateLogsModel.objects.using('fin').filter(
                estimate_date=current_month_start,
                login=input_login,
                frc=input_frc,
                is_revenue=input_is_revenue,
            ).first()

            
            if log_entry:
                # --- UPDATE EXISTING ROW LOGIC ---
                existing_array = log_entry.save_values or []
                if not isinstance(existing_array, list):
                    existing_array = [existing_array] if existing_array else []

                # Helper function to generate a unique tracking key for an item
                def get_item_key(item):
                    item_id = str(item.get('id', ''))
                    # Check if 'field' exists and is not None/empty
                    if 'subgroupName' in item and item['subgroupName'] is not None:
                        return (item_id, str(item['subgroupName']))
                    return item_id

                # Map existing items to our dynamic composite tracking keys
                merged_dict = {}
                for item in existing_array:
                    if 'id' in item:
                        key = get_item_key(item)
                        merged_dict[key] = item
                
                # Merge incoming data (overwrites if key matches, appends if new)
                for item in incoming_save_values:
                    if 'id' in item:
                        key = get_item_key(item)
                        merged_dict[key] = item

                # Convert the dictionary values back to a clean JSON array list
                updated_save_values = list(merged_dict.values())

                # Update the model timestamps and data
                log_entry.last_visited = now_timestamp
                log_entry.last_updated = now_timestamp
                log_entry.save_values = updated_save_values
                log_entry.save()

                return Response({
                    'status': 'updated',
                    'id': log_entry.id,
                    'message': 'Record updated. save_values safely deduplicated using dynamic identifiers.'
                }, status=status.HTTP_200_OK)

            else:
                # --- CREATE NEW ROW LOGIC ---
                new_entry = EstimateLogsModel.objects.using('fin').create(
                    user=input_user,
                    login=input_login,
                    frc=input_frc,
                    is_revenue=input_is_revenue,
                    estimate_date=first_day_of_month,
                    last_visited=now_timestamp,
                    last_updated=now_timestamp, 
                    save_values=incoming_save_values
                )

                return Response({
                    'status': 'created',
                    'id': new_entry.id,
                    'message': 'No existing constraint matched. Brand new row added.'
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Database processing failure: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LastUpdatedAPIView(APIView):
    def get(self, request):
        USE_TZ = True
        TIME_ZONE = "Europe/Moscow"
        moscow = ZoneInfo("Europe/Moscow")

        frc = request.GET.get("frc")
        is_revenue = request.GET.get("is_revenue")
        if not frc or not is_revenue:
            return Response({"detail": "frc and is_revenue required"}, status=400)

        result = ( 
            EstimateLogsModel.objects.using('fin')
            .filter(
                frc=frc,
                is_revenue=is_revenue,
                last_updated__isnull = False
            )
            #.annotate(
            #    formatted_last_updated=Coalesce(
            #        ToChar('last_updated', Value('DD.MM.YYYY HH24:MI:SS')),
            #        Value('Данные отсутствуют')
            #))
            .order_by("-last_updated")
            .values('user', 'last_updated')
            .first()
        )
        if result:
            user_list = result['user'].split()
            user = f"{user_list[0]} {user_list[1][0]}.{user_list[2][0]}."
            last_updated = timezone.localtime(result['last_updated'], moscow).strftime("%d.%m.%Y %H:%M:%S")
            return Response({'user': user, 'last_updated': last_updated })
        else: 
            return Response({'user': 'Нет данных', 'last_updated': 'Нет данных'})
