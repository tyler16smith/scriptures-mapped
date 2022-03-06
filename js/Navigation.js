/*========================================================================
 * FILE:    Navigation.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2022
 *
 * DESCRIPTION: Navigation module (volumes, books).
 *              IS 542, Winter 2022, BYU.
 */
/*jslint
    browser, long
*/

/*-------------------------------------------------------------------
 *                      IMPORTS
 */
import injectBreadcrumbs from "./Breadcrumbs.js";
import navigateChapter from "./Chapter.js";
import Html from "./HtmlHelper.js";
import {books, volumes} from "./MapScripApi.js";
import Api from "./MapScripApi.js";
import { animation } from "tailwindcss/defaultTheme";

/*-------------------------------------------------------------------
 *                      CONSTANTS
 */
const BOTTOM_PADDING = "<br /><br />";
const CLASS_BOOKS = "books";
const CLASS_BUTTON = "btn";
const CLASS_CHAPTER = "chapter";
const CLASS_VOLUME = "volume";
const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
const DIV_SCRIPTURES = "scriptures";
const TAG_HEADER5 = "h5";

/*-------------------------------------------------------------------
 *                      PRIVATE HELPERS
 */
const bookChapterValid = function (bookId, chapter) {
    let book = books[bookId];

    if (book === undefined || chapter < 0 || chapter > book.numChapters) {
        return false;
    }

    if (chapter === 0 && book.numChapters > 0) {
        return false;
    }

    return true;
};

const booksGrid = function (volume) {
    return Html.div({
        classKey: CLASS_BOOKS,
        content: booksGridContent(volume)
    });
};

const booksGridContent = function (volume) {
    let gridContent = "";

    volume.books.forEach(function (book) {
        gridContent += Html.link({
            classKey: CLASS_BUTTON,
            content: book.gridName,
            href: `#${volume.id}:${book.id}`,
            id: book.id
        });
    });

    return gridContent;
};

const chaptersGrid = function (book) {
    return Html.div({
        classKey: CLASS_VOLUME,
        content: Html.element(TAG_HEADER5, book.fullName)
    }) + Html.div({
        classKey: CLASS_BOOKS,
        content: chaptersGridContent(book)
    });
};

const chaptersGridContent = function (book) {
    let gridContent = "";
    let chapter = 1;

    while (chapter <= book.numChapters) {
        gridContent += Html.link({
            classKey: `${CLASS_BUTTON} ${CLASS_CHAPTER}`,
            content: chapter,
            href: `#0:${book.id}:${chapter}`,
            id: chapter
        });

        chapter += 1;
    }

    return gridContent;
};

const navigateBook = function (bookId) {
    let book = books[bookId];

    if (book.numChapters <= 1) {
        navigateChapter(bookId, book.numChapters);
    } else {
        document.getElementById(DIV_SCRIPTURES).innerHTML = Html.div({
            content: chaptersGrid(book),
            id: DIV_SCRIPTURES_NAVIGATOR
        });
        injectBreadcrumbs(Api.volumeForId(book.parentBookId), book);
    }
};

const navigateHome = function (volumeId) {
    document.getElementById(DIV_SCRIPTURES).innerHTML = Html.div({
        content: volumesGridContent(volumeId),
        id: DIV_SCRIPTURES_NAVIGATOR
    });
    injectBreadcrumbs(Api.volumeForId(volumeId));
};

const onHashChanged = function () {
    let ids = [];

    if (location.hash !== "" && location.hash.length > 1) {
        ids = location.hash.slice(1).split(":");
    }

    if (ids.length <= 0) {
        navigateHome();
    } else if (ids.length === 1) {
        let volumeId = Number(ids[0]);

        if (volumeId < volumes[0].id || volumeId > volumes.slice(-1)[0].id) {
            navigateHome();
        } else {
            navigateHome(volumeId);
        }
    } else {
        let bookId = Number(ids[1]);

        if (books[bookId] === undefined) {
            navigateHome();
        } else {
            if (ids.length === 2) {
                navigateBook(bookId);
            } else {
                let chapter = Number(ids[2]);
                let animationType = ids[3]; 

                if (bookChapterValid(bookId, chapter)) {
                    navigateChapter(bookId, chapter, animationType);
                } else {
                    navigateHome();
                }
            }
        }
    }
};

const volumesGridContent = function (volumeId) {
    let gridContent = "";

    volumes.forEach(function (volume) {
        if (volumeId === undefined || volumeId === volume.id) {
            gridContent += Html.div({
                classKey: CLASS_VOLUME,
                content: Html.anchor(volume) + Html.element(TAG_HEADER5, volume.fullName)
            });

            gridContent += booksGrid(volume);
        }
    });

    return gridContent + BOTTOM_PADDING;
};

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */
export {DIV_SCRIPTURES};
export default Object.freeze(onHashChanged);
