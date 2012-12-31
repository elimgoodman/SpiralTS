declare var $: any;
declare module Backbone {
   export class Model {
       constructor (attr? , opts? );
       get(name: string): any;
       set(name: string, val: any): void;
       set(obj: any): void;
       save(attr? , opts? ): void;
       destroy(): void;
       bind(ev: string, f: Function, ctx?: any): void;
       toJSON(): any;
       trigger(e:string);
   }
   export class Collection {
       constructor (models? , opts? );
       bind(ev: string, f: Function, ctx?: any): void;
       collection: Model;
       length: number;
       create(attrs, opts? ): Collection;
       each(f: (elem: any) => void ): void;
       fetch(opts?: any): void;
       last(): any;
       last(n: number): any[];
       filter(f: (elem: any) => any): Collection;
       without(...values: any[]): Collection;
   }
   export class View {
       constructor (options? );
       $(selector: string): any;
       el: any;
       $el: any;
       model: Model;
       remove(): void;
       delegateEvents: any;
       make(tagName: string, attrs? , opts? ): View;
       setElement(element: HTMLElement, delegate?: bool): void;
       tagName(): string;
       className(): string;
       events: any;
       initialize(): void;
       static extend: any;
   }
   export class Events {
        constructor (options? );
        on(e:string, cb:(anything?) => void, context: any);
        trigger(e:string);
   }
}
declare var _: any;
declare var Store: any;
