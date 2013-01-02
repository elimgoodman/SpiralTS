export class Field {
    constructor(public type: string){}
}

export class Instance {
    constructor(public name:string){}
}

export class Store {
    private fields: Field[];
}
