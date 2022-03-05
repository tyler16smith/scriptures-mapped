/*========================================================================
 * FILE:    Scriptures.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2021
 *
 * DESCRIPTION: Front-end JavaScript code for the Scriptures, Mapped.
 *              IS 542, Winter 2021, BYU.
 */
/*jslint
    browser, long
*/

/*-------------------------------------------------------------------
 *                      IMPORTS
 */
import Api from "./MapScripApi.js";
import MapHelper from "./MapHelper.js";
import onHashChanged from "./Navigation.js";

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */
const Scriptures = {
        init: Api.init,
        onHashChanged,
        showLocation: MapHelper.showLocation
    };

export default Object.freeze(Scriptures);
