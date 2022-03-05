/*========================================================================
 * FILE:    MapScripApi.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2022
 *
 * DESCRIPTION: Module for interacting with scriptures.byu.edu server.
 *              IS 542, Winter 2022, BYU.
 */
/*jslint
    browser, long
*/
/*global
    console, fetch
*/
/*property
    all, books, catch, forEach, freeze, init, json, length, log, maxBookId,
    message, minBookId, ok, push, requestChapter, text, then, volumeForId
*/

/*-------------------------------------------------------------------
 *                      CONSTANTS
 */
const URL_BASE = "https://scriptures.byu.edu/";
const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;

/*-------------------------------------------------------------------
 *                      VARIABLES
 */
let books;
let volumes;

/*-------------------------------------------------------------------
 *                      PRIVATE HELPERS
 */
const cacheBooks = function (callback) {
    volumes.forEach(function (volume) {
        let volumeBooks = [];
        let bookId = volume.minBookId;

        while (bookId <= volume.maxBookId) {
            volumeBooks.push(books[bookId]);
            bookId += 1;
        }

        volume.books = volumeBooks;
    });

    if (typeof callback === "function") {
        callback();
    }
};

const encodedScripturesUrlParameters = function (bookId, chapter, verses, isJst) {
    if (bookId !== undefined && chapter !== undefined) {
        let options = "";

        if (verses !== undefined) {
            options += verses;
        }

        if (isJst !== undefined) {
            options += "&jst=JST";
        }

        return `${URL_SCRIPTURES}?book=${bookId}&chap=${chapter}&verses${options}`;
    }
};

const getData = function (url, successCallback, failureCallback) {
    fetch(url).then(function (response) {
        if (response.ok) {
            return response.text();
        }

        throw new Error("Network response was not okay.");
    }).then(function (data) {
        if (typeof successCallback === "function") {
            successCallback(data);
        } else {
            throw new Error("Callback is not a valid function.");
        }
    }).catch(function (error) {
        console.log("Error:", error.message);

        if (typeof failureCallback === "function") {
            failureCallback(error);
        }
    });
};

const getJSON = function (url) {
    return fetch(url).then(function (response) {
        if (response.ok) {
            return response.json();
        }
    });
};

const init = function (callback) {
    Promise.all([getJSON(URL_BOOKS), getJSON(URL_VOLUMES)]).then(function (jsonResults) {
        const [booksJson, volumesJson] = jsonResults;

        books = booksJson;
        volumes = volumesJson;
        cacheBooks(callback);
    });
};

const requestChapter = function (bookId, chapter, success, failure) {
    getData(encodedScripturesUrlParameters(bookId, chapter), success, failure);
};

const volumeForId = function (volumeId) {
    if (volumeId !== undefined && volumeId > 0 && volumeId < volumes.length) {
        return volumes[volumeId - 1];
    }
};

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */
const MapScripApi = {
    init,
    requestChapter,
    volumeForId
};

export {books, volumes};
export default Object.freeze(MapScripApi);
