/**
 * Interface para callback buscador de itens para Select.
 *
 * @author Giancarlo Dalle Mole
 * @since 27/04/2019
 */
export interface Fetcher<T> {

    (search: string): Array<T> | Promise<Array<T>>;
}
