export class User {
    constructor(
        public userName: string,
        public _token: string,
        public expireIn: Date,
        public refreshToken: string,
        public referenceId: number,
        public referenceType : number,
        public language: string,
        public permissions : string[] | null = [],

    ) {}

    get token() {
        if (new Date() > this.expireIn) {
            return null;
        }
        return this._token;
    }
}
