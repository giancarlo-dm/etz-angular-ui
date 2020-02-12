/**
 * Posicionamentos possíveis para elementos flutuantes (dropdowns, tooltips, datepickers, etc) em
 * relação ao elemento mestre.
 *
 * <ul>
 *  <li>"auto" - Posicionamento automático. Preferencial: "bottom"</li>
 *  <li>"auto-h" - Posicionamento automático na horizontal ("left", "right"). Preferencial: "left"</li>
 *  <li>"auto-v" - Posicionamento automático na vertical ("top", "bottom", "top-left", "top-right",
 *  "bottom-right", "bottom-left"). Preferencial: "bottom"</li>
 *  <li>"top" - Posicionamento acima do elemento mestre, centralizado.</li>
 *  <li>"bottom" - Posicionamento abaixo do elemento mestre, centralizado.</li>
 *  <li>"top-left" - Posicionamento acima do elemento mestre, com ponto de referência a esquerda do
 *  elemento mestre, jogando o corpo do elemento flutuante a direita.</li>
 *  <li>"top-right" - Posicionamento acima do elemento mestre, com ponto de referência a direita do
 *  elemento mestre, jogando o corpo do elemento flutuante a esquerda.</li>
 *  <li>"bottom-left" - Posicionamento abaixo do elemento mestre, com ponto de referência a esquerda
 *  do elemento mestre, jogando o corpo do elemento flutuante a direita.</li>
 *  <li>"bottom-right" - Posicionamento abaixo do elemento mestre, com ponto de referência a direita
 *  do elemento mestre, jogando o corpo do elemento flutuante a esquerda.</li>
 * </ul>
 *
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 15/04/2019
 */
export type Placement = "auto" | "auto-h" | "auto-v" | "top" | "bottom" | "left" | "right"
    | "top-left" | "top-right" | "bottom-left" | "bottom-right";
