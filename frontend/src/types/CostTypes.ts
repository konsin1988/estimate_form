export type ApiCostRow = {
  id: number | null;
  month: string;
  month_name: string;
  source: string;
  group: string;
  subgroup: string;
  amount: number;
  is_editable: number;
};

export type CostCell = {
  id: number | null;
  amount: number;
  is_editable: boolean;
};

export type SubgroupRow = {
  type: "subgroup";
  name: string;

  values: {
    [month: string]: {
      [source: string]: CostCell;
    };
  };
};

export type GroupRow = {
  type: "group";
  name: string;

  values: {
    [month: string]: {
      [source: string]: {
        amount: number;
      };
    };
  };

  subRows: SubgroupRow[];
};

export type TotalRow = {
  id: string;
  type: "total";
  name: string;

  values: {
    [month: string]: {
      [source: string]: {
        amount: number;
      };
    };
  };

  subRows: GroupRow[];
};


export type GroupEntry = {
  group: GroupRow;
  subgroupMap: Map<string, SubgroupRow>;
};

export type TableRow =
    | TotalRow
    | GroupRow
    | SubgroupRow;
