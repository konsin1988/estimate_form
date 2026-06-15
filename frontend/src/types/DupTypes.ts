export type ApiDupRow = {
  id: number | null;
  month: string;
  month_name: string;
  source: string;
  division: string;
  frc: string;
  subgroup: string;
  amount: number;
  is_editable: number;
};

export type CostCell = {
  id: number | null;
  amount: number;
  is_editable: boolean;
};

export type DupSubgroupRow = {
  type: "subgroup";
  name: string;

  values: {
    [month: string]: {
      [source: string]: CostCell;
    };
  };
};

export type DupFrcRow = {
  type: "frc";
  name: string;

  values: {
    [month: string]: {
      [source: string]: {
        amount: number;
      };
    };
  };

  subRows: DupSubgroupRow[];
};


export type DupDivisionRow = {
  type: "division";
  name: string;

  values: {
    [month: string]: {
      [source: string]: {
        amount: number;
      };
    };
  };
  subRows: DupFrcRow[];
};
