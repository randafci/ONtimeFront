export interface Team {
  id: number;
  code: string;
  name: string;
  nameSE?: string;
  organizationId?: number;
}

export interface CreateTeam {
  code: string;
  name: string;
  nameSE?: string;
  organizationId?: number;
}

export interface EditTeam extends CreateTeam {
  id: number;
}
