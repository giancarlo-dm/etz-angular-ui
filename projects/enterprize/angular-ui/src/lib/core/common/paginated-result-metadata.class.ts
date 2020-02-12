/**
 * Metadados de resultado de consulta páginada
 *
 * @author Giancarlo Dalle Mole
 * @since 22/11/2018
 */
export class PaginatedResultMetadata {

    //#region Public Attributes
    /**
     * @Serialize
     * Total de registros disponíveis baseado nos parâmetros de consulta
     */
    public total: number;
    /**
     * @Serialize
     * Número de registros por página
     */
    public limit: number;
    /**
     * @Serialize
     * Número de registro pulados
     */
    public skip: number;
    //#endregion

    //#region Constructors
    constructor();
    constructor(total: number);
    constructor(total: number, limit: number);
    constructor(total: number, limit: number, skip: number);
    constructor(...args: []|[number]|[number, number]|[number, number, number]) {

        if (args.length > 0) {

            this.total = args[0];
            this.limit = args[1];
            this.skip = args[2];
        }
    }
    //#endregion
}
