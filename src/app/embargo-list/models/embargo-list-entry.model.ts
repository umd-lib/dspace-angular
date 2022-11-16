/**
 * Interface for a single embargo list entry
 */
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

/**
 * Interface for processing the embargo list REST response
 */
export interface EmbargoListResponse {
  payload: EmbargoListEntry[];
}
