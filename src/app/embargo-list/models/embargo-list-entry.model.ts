export interface EmbargoListEntry {
  handle: string,
  itemId: string,
  bitstreamId: string,
  title: string,
  advisor: string,
  author: string,
  department: string,
  type: string,
  endDate: string
}

export interface EmbargoListResponse {
  payload: EmbargoListEntry[];
}
