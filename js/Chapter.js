/*========================================================================
 * FILE:    Chapter.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2022
 *
 * DESCRIPTION: Module for chapter updates.
 *              IS 542, Winter 2022, BYU.
 */
/*jslint
    browser, long
*/

/*-------------------------------------------------------------------
 *                      IMPORTS
 */
import injectBreadcrumbs from "./Breadcrumbs.js";
import Html from "./HtmlHelper.js";
import MapHelper from "./MapHelper.js";
import {books} from "./MapScripApi.js";
import Api from "./MapScripApi.js";
import {DIV_SCRIPTURES} from "./Navigation.js";

/*-------------------------------------------------------------------
 *                      CONSTANTS
 */
const CLASS_ICON = "material-icons";
const ICON_NEXT = "skip_next";
const ICON_PREVIOUS = "skip_previous";
const TAG_SPAN = "span";

/*-------------------------------------------------------------------
 *                      VARIABLES
 */
let requestedBookId;
let requestedChapter;
let requestedNextPrevious;

/*-------------------------------------------------------------------
 *                      PRIVATE HELPERS
 */
const getScripturesCallback = function (chapterHtml) {
    let book = books[requestedBookId];

    document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;

    document.querySelectorAll(".navheading").forEach(function (element) {
        element.innerHTML += `<div class="nextprev">${requestedNextPrevious}</div>`;
    });

    injectBreadcrumbs(Api.volumeForId(book.parentBookId), book, requestedChapter);
    MapHelper.setupMarkers();
};

const getScripturesFailure = function () {
    document.getElementById(DIV_SCRIPTURES).innerHTML = "Unable to retrieve chapter contents.";
    injectBreadcrumbs();
};

const navigateChapter = function (bookId, chapter) {
    requestedBookId = bookId;
    requestedChapter = chapter;

    let nextPrev = previousChapter(bookId, chapter);

    if (nextPrev === undefined) {
        requestedNextPrevious = "";
    } else {
        requestedNextPrevious = nextPreviousMarkup(nextPrev, ICON_PREVIOUS);
    }

    nextPrev = nextChapter(bookId, chapter);

    if (nextPrev !== undefined) {
        requestedNextPrevious += nextPreviousMarkup(nextPrev, ICON_NEXT);
    }

    Api.requestChapter(bookId, chapter, getScripturesCallback, getScripturesFailure);
};

const nextChapter = function (bookId, chapter) {
    let book = books[bookId];

    if (book !== undefined) {
        if (chapter < book.numChapters) {
            return [
                bookId,
                chapter + 1,
                titleForBookChapter(book, chapter + 1)
            ];
        }

        let nextBook = books[bookId + 1];

        if (nextBook !== undefined) {
            let nextChapterValue = 0;

            if (nextBook.numChapters > 0) {
                nextChapterValue = 1;
            }

            return [
                nextBook.id,
                nextChapterValue,
                titleForBookChapter(nextBook, nextChapterValue)
            ];
        }
    }
};

const nextPreviousMarkup = function (nextPrev, icon) {
    return Html.link({
        content: Html.element(TAG_SPAN, icon, CLASS_ICON),
        href: `#0:${nextPrev[0]}:${nextPrev[1]}`,
        title: nextPrev[2]
    });
};

const previousChapter = function (bookId, chapter) {
    let book = books[bookId];

    if (book !== undefined) {
        if (chapter > 1) {
            return [
                bookId,
                chapter - 1,
                titleForBookChapter(book, chapter - 1)
            ];
        }

        let previousBook = books[bookId - 1];

        if (previousBook !== undefined) {
            return [
                previousBook.id,
                previousBook.numChapters,
                titleForBookChapter(previousBook, previousBook.numChapters)
            ];
        }
    }
};

const titleForBookChapter = function (book, chapter) {
    if (book !== undefined) {
        if (chapter > 0) {
            return `${book.tocName} ${chapter}`;
        }

        return book.tocName;
    }
};

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */
export default Object.freeze(navigateChapter);
