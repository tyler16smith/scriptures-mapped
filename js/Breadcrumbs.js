/*========================================================================
 * FILE:    Breadcrumbs.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2022
 *
 * DESCRIPTION: Breadcrumbs module.
 *              IS 542, Winter 2022, BYU.
 */
/*jslint
    browser, long
*/

/*-------------------------------------------------------------------
 *                      IMPORTS
 */
import Html from './HtmlHelper.js';

/*-------------------------------------------------------------------
 *                      CONSTANTS
 */
const DIV_BREADCRUMBS = "crumbs";
const TAG_UNORDERED_LIST = "ul";
const TEXT_TOP_LEVEL = "The Scriptures";

/*-------------------------------------------------------------------
 *                      PRIVATE HELPERS
 */
const injectBreadcrumbs = function (volume, book, chapter) {
    let crumbs = "";

    if (volume === undefined) {
        crumbs = Html.listItem(TEXT_TOP_LEVEL);
    } else {
        crumbs = Html.listItemLink(TEXT_TOP_LEVEL);

        if (book === undefined) {
            crumbs += Html.listItem(volume.fullName);
        } else {
            crumbs += Html.listItemLink(volume.fullName, volume.id);

            if (chapter === undefined || chapter <= 0) {
                crumbs += Html.listItem(book.tocName);
            } else {
                crumbs += Html.listItemLink(book.tocName, `${volume.id}:${book.id}`);
                crumbs += Html.listItem(chapter);
            }
        }
    }

    document.getElementById(DIV_BREADCRUMBS).innerHTML = Html.element(TAG_UNORDERED_LIST, crumbs);
};

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */

export default Object.freeze(injectBreadcrumbs);
