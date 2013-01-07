export class Globals {
    private vars = {};

    get(key:string) {
        return this.vars[key];
    }

    set(key:string, val:any) {
        this.vars[key] = val;
    }
}
