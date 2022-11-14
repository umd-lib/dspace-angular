export class EmbargoListEntry {
  constructor(
    public handle?: string,
    public itemId?: string,
    public bitstreamId?: string,
    public title?: string,
    public advisor?: string,
    public author?: string,
    public department?: string,
    public type?: string,
    public endDate?: string
    ) { }
}