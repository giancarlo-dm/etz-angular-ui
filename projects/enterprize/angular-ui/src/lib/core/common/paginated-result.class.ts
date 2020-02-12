import { PaginatedResultMetadata } from "./paginated-result-metadata.class";

/**
 * Classe que representa o resultado de uma consulta paginada. Contém a lista de resultados e metadados referentes a consulta.
 *
 * @author Giancarlo Dalle Mole
 * @since 22/11/2018
 */
export class PaginatedResult<T> implements Iterable<T> {

    //#region Public Attributes
    /**
     * Lista de resultados da consulta paginada
     */
    public result: Array<T>;
    /**
     * Metadados da consulta paginada
     */
    public metadata: PaginatedResultMetadata;
    //#endregion

    //#region Constructors
    constructor();
    constructor(result: Array<T>, metadata: PaginatedResultMetadata);
    constructor(...args: []|[Array<T>, PaginatedResultMetadata]) {

        if (args.length === 2) {
            this.result = args[0];
            this.metadata = args[1];
        }
    }
    //#endregion

    //#region Iterable Methods
    [Symbol.iterator]() {

        let pointer: number = 0;
        const result: Array<T> = this.result;

        return {

            next(): IteratorResult<T> {

                if (pointer < result.length) {

                    return {
                        done: false,
                        value: result[pointer++]
                    };
                }
                else {
                    return {
                        done: true,
                        value: undefined
                    };
                }
            }
        };
    }
    //#endregion
}
