import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateField, saveEst } from "../store/estSlice";
import debounce from "lodash.debounce";
import api from "../services/api";
import dayjs from "dayjs";
import axios from "axios";
import { useNumberFormatter } from "../hooks/useNumberFormatter";
import Modal from "./Modal";

import { getDelta } from "../scripts/getDelta";
const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь", "Год, всего"];
const ROW_NAMES = ["Выручка", "Контракт", "ВСК", "Прогноз"]; 


export default function CostsForecastTable (){
  
}
