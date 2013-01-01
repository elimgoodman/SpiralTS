export class Editor {
    constructor(public display_text: string, public value_field: string){}

    getTemplate(): string {
        return "none";
    }
}

export class Name extends Editor {
    getTemplate() {
        return "<input value='<%= value %>'/>";
    }
}    

export class URL extends Editor {
    getTemplate() {
        return "<input value='<%= value %>'/>";
    }
}

export class HTML extends Editor {
    getTemplate() {

        return "<textarea>'<%= value %>'</textarea>";
    }
}
