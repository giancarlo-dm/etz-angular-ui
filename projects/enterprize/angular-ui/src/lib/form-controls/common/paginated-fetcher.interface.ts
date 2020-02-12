import { PaginatedResult } from "../../core/common/paginated-result.class";

/**
 * Interface para callback buscador paginado de itens para Select.
 *
 * @author Giancarlo Dalle Mole
 * @since 27/04/2019
 */
export interface PaginatedFetcher<T> {

    /**
     * @param search Termo de busca usado
     * @param page
     */
    (search: string, page: number): PaginatedResult<T> | Promise<PaginatedResult<T>>
}
