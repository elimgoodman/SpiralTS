export class Field {
    constructor(public name:string){}
}

export class Str extends Field {}
export class URL extends Str {}
export class HTML extends Str {}

export class Store {
    private fields: Field[];
}
