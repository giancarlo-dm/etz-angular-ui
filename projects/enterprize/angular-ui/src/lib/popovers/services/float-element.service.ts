import { Inject, Injectable, Renderer2 } from "@angular/core";
import { DOCUMENT } from "@angular/common";

import { Placement } from "../common/placements.type";


/**
 * Serviço de posicionamento de elementos flutuantes.
 *
 * @since 08/05/2019
 **/
@Injectable({
    providedIn: "root"
})
export class FloatElementService {

    //#region Private Attributes
    /**
     * @injected
     * Serviço Document da raíz do JS.
     */
    private readonly document: Document;
    //#endregion

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any) {

        //Injetados
        this.document = document;
    }
    //#endregion

    //#region Public Methods
    /**
     * Posicionar elemento flutuante com base em uma origem e a localização desejado.
     * @param renderer Serviço de renderização de templates para o DOM do angular.
     * @param floatElement Elemento flutuante que será posicionado.
     * @param origin Origem(elemento) do elemento flutuante.
     * @param margin Margem que o elemento flutuante terá de sua origem.
     * @param placement Localização desejada do elemento flutuante.
     * @param container String contendo o container desejado da criação do elemento flutuante
     */
    public positionElement(renderer: Renderer2, floatElement: HTMLElement, origin: HTMLElement,
                           margin: number, placement: Placement, container: string): void {


        const zIndex: number = this.getElementZIndexRelativeToBody(origin) + 100;
        const relativeToBody: boolean = !this.hasNonStaticPositionInParentNodes(origin) || container == "body";
        const originPosition = this.getElementPosition(origin, relativeToBody);
        const elementContainers = this.applyContainer(renderer, floatElement, origin, container);

        let[placementPrimary = "auto", placementSecondary = ""] = placement.split("-");
        if (placementPrimary == "auto") {

            placementPrimary = this.setAutoPosition(floatElement, origin, elementContainers,
                container, placementSecondary, margin);
            placementSecondary = "";
        }

        floatElement.style.zIndex = `${zIndex}`;

        if (placementPrimary == "top") {

            floatElement.style.top = `${originPosition.offsetTop - floatElement.getBoundingClientRect().height - margin}px`;

            if (placementSecondary == "left") {
                floatElement.style.left = `${originPosition.offsetLeft - (floatElement.getBoundingClientRect().width -
                    origin.getBoundingClientRect().width)}px`;
            }
            else if (placementSecondary == "right") {
                floatElement.style.left = `${originPosition.offsetLeft}px`;
            }
            else {
                floatElement.style.left = `${originPosition.offsetLeft - (floatElement.getBoundingClientRect().width -
                    origin.getBoundingClientRect().width)/2}px`;
            }
        }
        // posicionar 'bottom', 'bottom-left' e 'bottom-right'
        else if (placementPrimary == "bottom") {

            floatElement.style.top = `${originPosition.offsetTop + origin.getBoundingClientRect().height + margin}px`;

            if (placementSecondary == "left") {
                floatElement.style.left = `${originPosition.offsetLeft - (floatElement.getBoundingClientRect().width - origin.getBoundingClientRect().width)}px`;
            }
            else if (placementSecondary == "right") {
                floatElement.style.left = `${originPosition.offsetLeft}px`;
            }
            else {
                floatElement.style.left = `${originPosition.offsetLeft - (floatElement.getBoundingClientRect().width - origin.getBoundingClientRect().width)/2}px`;
            }
        }

        // posicionar 'right'
        else if (placementPrimary == "right") {

            floatElement.style.left = `${originPosition.offsetLeft + origin.getBoundingClientRect().width + margin}px`;
            floatElement.style.top = `${originPosition.offsetTop + origin.getBoundingClientRect().height / 2 -
            floatElement.getBoundingClientRect().height / 2}px`;
        }
        // posicionar 'left'
        else if (placementPrimary == "left") {

            floatElement.style.left = `${originPosition.offsetLeft - floatElement.getBoundingClientRect().width - margin}px`;
            floatElement.style.top = `${originPosition.offsetTop + origin.getBoundingClientRect().height / 2 -
            floatElement.getBoundingClientRect().height / 2}px`;
        }
    }

    /**
     * Redimensionar o elemento conforme o tamanho do elemento de referência.
     * @param floatElement Elemento flutuante que será redimensionado.
     * @param origin Elemento de referência que será base para a nova largura do elemento flutuante.
     * @return Nova largura do elemento flutuante.
     */
    public resizeElement(floatElement: HTMLElement, origin: HTMLElement): number {

        floatElement.style.width = `${origin.offsetWidth}px`;
        return origin.offsetWidth;
    }

    /**
     * Retornar o diálogo ativo.
     */
    public getOpenDialog(): Element {

        const dialogs = this.document.getElementsByClassName("modal fade show d-block");
        if (dialogs != null && dialogs.length > 0) {

            for (let i = 0; i < dialogs.length; i++) {

                const dialog: Element = dialogs.item(i);
                if (dialog.getAttribute("aria-hidden") == null) {

                    return dialog;
                }
            }
        }

        return null;
    }
    //#endregion

    //#region Private Methods
    /**
     * Retornar a posição de um elemento.
     * @param element Elemento que terá sua posição retornada.
     * @param relativeToBody Flag que indica se a posição deve ser em relação ao body.
     * @return Posição do elemento.
     */
    private getElementPosition(element: HTMLElement, relativeToBody?: boolean): {offsetLeft: number, offsetTop: number} {

        relativeToBody = relativeToBody != null ? relativeToBody : false;
        if (relativeToBody) {

            let offsetTop: number = element.offsetTop;
            let offsetLeft: number = element.offsetLeft;
            let htmlElement = element;

            while (htmlElement.offsetParent != null) {

                htmlElement = htmlElement.offsetParent as HTMLElement;
                offsetTop += htmlElement.offsetTop;
                offsetLeft += htmlElement.offsetLeft;
            }

            return {offsetLeft: offsetLeft, offsetTop: offsetTop};
        }
        else {

            return {
                offsetLeft: element.offsetLeft,
                offsetTop: element.offsetTop
            };
        }
    }

    /**
     * Aplicar e retornar o container que o elemento flutuante será possicionado.
     * @param renderer Serviço de renderização de templates para o DOM do angular.
     * @param floatElement Elemento que será flutuado.
     * @param origin Elemento de origem do elemento flutuante.
     * @param container Container base para a seleção do container final.
     * @return Container de scroll e de posicionamento que o elemento utilizará, já criados e
     * prontos. Veja {@link FloatElementContainer}
     */
    private applyContainer(renderer: Renderer2, floatElement: HTMLElement, origin: HTMLElement,
                           container: string): FloatElementContainer {

        const dialog: Element = this.getOpenDialog();
        if (container == "body") {

            // if (origin.offsetParent != this.document.body) {

                //append no diálogo
                if (dialog) {
                    renderer.appendChild(dialog, floatElement);
                }
                else {
                    renderer.appendChild(this.document.body, floatElement);
                }
            // }
            return {
                positionContainer: this.document.body,
                scrollContainer: dialog != null ? dialog as HTMLElement : this.document.body
            };
        }
        else {

            return {
                positionContainer: dialog != null ? dialog as HTMLElement : origin.offsetParent as HTMLElement,
                scrollContainer: dialog != null ? dialog as HTMLElement : this.document.body
            };
        }
    }

    /**
     * Retornar o z-index do elemento em relação ao body.
     * @param element Elemento que terá seu z-index retornado.
     * @retunr z-index do elemento.
     */
    private getElementZIndexRelativeToBody(element: HTMLElement): number {

        let zIndex: number = 0;
        let htmlElement = element;
        while (htmlElement != this.document.body && htmlElement.offsetParent != null) {

            htmlElement = htmlElement.offsetParent as HTMLElement;

            let zIndexNumber = Number(window.getComputedStyle(htmlElement)["zIndex"]);
            zIndex += !isNaN(zIndexNumber) ? zIndexNumber : 0;
        }
        return zIndex;
    }

    /**
     * Retornar se existe um nodo nos elementos pais com position diferente de static.
     * @param element Elemento a ser verificado.
     * @return True se existe um nodo pai com position diferente de static.
     */
    private hasNonStaticPositionInParentNodes(element: HTMLElement): boolean {

        let htmlElement = element;
        while (htmlElement != this.document.body && htmlElement.parentElement != null) {

            if (["relative", "fixed", "absolute"].indexOf(window.getComputedStyle(htmlElement)["position"]) != -1) {
                return true;
            }
            htmlElement = htmlElement.parentElement as HTMLElement;
        }

        return false;
    }

    /**
     * Retornar o scroll corrente da página baseado no container de scroll do elemento.
     * @param scrollContainer Container do elemento flutuante que possuí o scroll.
     * @return O scroll horizontal e vertical.
     */
    private getPageScroll(scrollContainer: HTMLElement): {scrollTop: number, scrollLeft: number} {

        if (scrollContainer != this.document.body) {
            return {scrollTop: scrollContainer.scrollTop, scrollLeft: scrollContainer.scrollLeft};
        }
        else {
            return {scrollTop: window.pageYOffset, scrollLeft: window.pageXOffset};
        }
    }

    /**
     * Calcular o melhor posicionamento automaticamente.
     * @param floatElement Elemento flutuante que será base do cálculo de posicionamento.
     * @param origin Origem do elemento flutuante.
     * @param floatElementContainer Container onde o elemento flutuante será posicionado.
     * @param placementSecondary Usado apenas em caso de 'auto', 'h' para limitar a apenas
     * horizontal, 'v' para limitar a apenas vertical e '' para ambos.
     * @param container Container onde o elemento flutuante será alocado.
     * @param margin Margem do elmento flutuante em relação a origem.
     * @return String contendo o melhor posicionamento segundo o algoritmo.
     */
    private setAutoPosition(floatElement: HTMLElement, origin: HTMLElement,
                            floatElementContainer: FloatElementContainer,
                            container: string, placementSecondary: string, margin: number): string {

        if (floatElementContainer.positionContainer == this.document.body) {
            floatElementContainer.positionContainer = this.document.body.parentElement;
        }

        const scroll = this.getPageScroll(floatElementContainer.scrollContainer);
        const offsets = this.getElementPosition(origin, container == "body");

        // Valores minimos de cada offset, estes serão sobrescritos quando necessário a utilização de
        //offsets maiores.
        let offsetTop: number = offsets.offsetTop + origin.getBoundingClientRect().height / 2
            - margin - scroll.scrollTop;

        let offsetLeft: number = offsets.offsetLeft + origin.getBoundingClientRect().width / 2
            - margin - scroll.scrollLeft;
        let offsetBottom: number = 0;
        let offsetRight: number = 0;

        // Caso seja um diálogo em container díalogo
        if (floatElementContainer.positionContainer != this.document.body.parentElement &&
            floatElementContainer.scrollContainer != this.document.body) {

            const parentContainer: HTMLElement = floatElementContainer.positionContainer.firstElementChild as HTMLElement;
            if (scroll.scrollTop > parentContainer.offsetTop) {
                offsetTop += parentContainer.offsetTop;
            }

            if (scroll.scrollLeft > parentContainer.offsetLeft) {
                offsetLeft += parentContainer.offsetLeft;
            }

            // Pixels abaixo que podem ser dado scroll.
            const bottomToScroll = floatElementContainer.scrollContainer.scrollHeight
                - floatElementContainer.scrollContainer.clientHeight - scroll.scrollTop;
            offsetBottom = parentContainer.offsetHeight - offsets.offsetTop
                - origin.getBoundingClientRect().height / 2 - margin;
            if (bottomToScroll > parentContainer.offsetTop) {
                offsetBottom -= (bottomToScroll - parentContainer.offsetTop);
            }

            // Pixels a direita que podem ser dado scroll.
            const rightToScroll = floatElementContainer.scrollContainer.scrollWidth
                - floatElementContainer.scrollContainer.clientWidth - scroll.scrollLeft;
            offsetRight = parentContainer.offsetWidth - offsets.offsetLeft
                - origin.getBoundingClientRect().width / 2 - margin;
            if (rightToScroll > parentContainer.offsetLeft) {
                offsetRight -= (bottomToScroll - parentContainer.offsetLeft);
            }
        }
        // Demais casos.
        else {

            offsetBottom = floatElementContainer.positionContainer.getBoundingClientRect().height
                - offsets.offsetTop - origin.getBoundingClientRect().height / 2 + scroll.scrollTop - margin;
            offsetRight = floatElementContainer.positionContainer.getBoundingClientRect().width
                - offsets.offsetLeft - origin.getBoundingClientRect().width / 2 + scroll.scrollLeft;
        }

        // se 'auto', tentar posicionar verticalmente e caso não for possível prosseguir para
        //o posicionamento horizontal.
        // se 'auto-v' forçar o posicionamento vertical.
        if (placementSecondary == "v" || placementSecondary == "") {

            offsetBottom -= origin.offsetHeight / 2;

            if (floatElement.offsetHeight <= offsetBottom &&
                floatElement.offsetWidth / 2 <= offsetLeft &&
                floatElement.offsetWidth / 2 <= offsetRight) {

                return "bottom";
            }
            else {

                offsetBottom += origin.offsetHeight / 2;
                offsetTop -= origin.offsetHeight / 2;
                if (floatElement.offsetHeight <= offsetTop &&
                    floatElement.offsetWidth / 2 <= offsetLeft &&
                    floatElement.offsetWidth / 2 <= offsetRight) {

                    return "top";
                }
                else if (placementSecondary == "v") {

                    return "bottom";
                }
                offsetTop += origin.offsetHeight / 2;
            }
        }
        // se 'auto', tentar posicionar horizontalmente e caso não for possível, posicionar para 'bottom'
        // se 'auto-h' forçar o posicionamento horizontal.
        if (placementSecondary == "h" || placementSecondary == "") {

            offsetLeft -= origin.offsetWidth / 2;
            if (floatElement.offsetWidth <= offsetLeft &&
                floatElement.offsetHeight / 2 <= offsetTop &&
                floatElement.offsetHeight / 2 <= offsetBottom) {

                return "left";
            }
            else {
                offsetRight -= origin.offsetWidth / 2;
                if (floatElement.offsetWidth <= offsetRight &&
                    floatElement.offsetHeight / 2 <= offsetTop &&
                    floatElement.offsetHeight / 2 <= offsetBottom) {

                    return "right";
                }
                else if (placementSecondary == "h") {

                    return "left";
                }
            }
        }

        return "bottom";
    }
    //#endregion
}

/**
 * Containers do elemento flutuante para posicionamento do mesmo.
 *
 * @since 18/06/2019
 */
type FloatElementContainer = {
    /**
     * Container que o elemento será posicionado.
     */
    positionContainer: HTMLElement,
    /**
     * Container que irá conter o scroll que o elemento flutuante irá respeitar.
     */
    scrollContainer: HTMLElement
};
