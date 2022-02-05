/*========================================================================
 * FILE:    scriptures.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2021
 *
 * DESCRIPTION: Front-end JavaScript code for the Scriptures, Mapped.
 *              IS 542, Winter 2021, BYU.
 */
/*jslint
    browser, long
*/
/*global
    console, map
*/
/*property
    books, classKey, content, exec, forEach, fullName, getAttribute,
    getElementById, gridName, hash, href, id, init, innerHTML, length, log,
    maxBookId, minBookId, numChapters, onHashChanged, onerror, onload, open,
    parse, push, querySelectorAll, response, send, setMap, slice, split, status,
    tocName
*/

const Scriptures = (function () {
    "use strict";

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
    const INDEX_BOOK = 1;
    const INDEX_CHAPTER = 2;
    const INDEX_FLAG = 11;
    const INDEX_LATITUDE = 3;
    const INDEX_LONGITUDE = 4;
    const INDEX_PLACENAME = 2;
    const INDEX_VOLUME = 0;
    const LAT_LONG_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
    const REQUEST_GET = "GET";
    const REQUEST_STATUS_OK = 200;
    const REQUEST_STATUS_ERROR = 400;
    const TAG_HEADER5 = "h5";
    const URL_BASE = "https://scriptures.byu.edu/";
    const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
    const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
    const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;

    /*-------------------------------------------------------------------
     *                      PRIVATE VARIABLES
     */
    let books;
    let gmMarkers = []; // track all markers in chapters
    let volumes;

    /*-------------------------------------------------------------------
     *                      PRIVATE METHOD DECLARATIONS
     */
    let addMarker;
    let ajax;
    let bookChapterValid;
    let booksGrid;
    let booksGridContent;
    let chaptersGrid;
    let chaptersGridContent;
    let cacheBooks;
    let clearMarkers;
    let encodedScripturesURLParameters;
    let getScripturesCallback;
    let getScripturesFailure;
    let htmlAnchor;
    let htmlDiv;
    let htmlElement;
    let htmlLink;
    let htmlHashLink;
    let init;
    let navigateBook;
    let navigateChapter;
    let navigateHome;
    let nextChapter;
    let onHashChanged;
    let previousChapter;
    let setupMarkers;
    let showLocation;
    let testGeoplaces;
    let titleForBookChapter;
    let volumesGridContent;

    /*-------------------------------------------------------------------
     *                      PRIVATE METHODS
     */

    addMarker = function (placename, latitude, longitude) {
        // NEEDSWORK: check to see if we already have this latitude/longitude in the gmMarkers array
        // NEEDSWORK: create the marker and append to gmMarkers

        let marker = new google.maps.Marker({
            position: {lat: Number(latitude), lng: Number(longitude)},
            map,
            title: placename,
            animation: google.maps.Animation.DROP
        });

        gmMarkers.push(marker);
    };

    ajax = function (url, successCallback, failureCallback, skipJsonParse) { // skipJsonParse = undefined (falsy) if nothing is passed in
        let request = new XMLHttpRequest();

        request.open(REQUEST_GET, url, true);

        request.onload = function () {
            if (request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR) {
                let data = (                            // Ternary operator:
                    skipJsonParse                       // if
                    ? request.response                  // then
                    : JSON.parse(request.response)      // else
                )

                if (typeof successCallback === "function") {
                    successCallback(data);
                }
            } else {
                if (typeof failureCallback === "function") {
                    failureCallback(request);
                }
            }
        };

        request.onerror = failureCallback;
        request.send();
    };

    bookChapterValid = function (bookId, chapter) {
        let book = books[bookId];

        // chapters can be zero (title page of the Book of Mormon) unless the book HAS chapters
        if (book === undefined || chapter < 0 || chapter > book.numChapters) {
            return false;
        }
        if (chapter === 0 && book.numChapters > 0) {
            return false;
        }

        return true;
    };

    booksGrid = function (volume) {
        return htmlDiv({
            classKey: CLASS_BOOKS,
            content: booksGridContent(volume)
        });
    };

    booksGridContent = function (volume) {
        let gridContent = "";

        //hyper link for each of the books
        volume.books.forEach(function (book) {
            gridContent += htmlLink({
                classKey: CLASS_BUTTON,
                id: book.id,
                href: `#${volume.id}:${book.id}`,
                content: book.gridName
            })
        })

        return gridContent;
    };

    cacheBooks = function (callback) {
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

    chaptersGrid = function (book) {
        return htmlDiv({
            classKey: CLASS_VOLUME,
            content: htmlElement(TAG_HEADER5, book.fullName)
        }) + htmlDiv({
            classKey: CLASS_BOOKS,
            content: chaptersGridContent(book)
        });
    };

    chaptersGridContent = function (book) {
        let gridContent = "";
        let chapter = 1; // iterate until you have a button for every chapter

        while (chapter <= book.numChapters) {
            gridContent += htmlLink({
                classKey: `${CLASS_BUTTON} ${CLASS_CHAPTER}`,
                id: chapter,
                href: `#0:${book.id}:${chapter}`,
                content: chapter
            })
            chapter += 1;
        }

        return gridContent;
    };

    clearMarkers = function () {
        gmMarkers.forEach(function (marker) {
            marker.setMap(null);
        });
        
        // clear out array
        gmMarkers = [];
    };

    encodedScripturesURLParameters = function (bookId, chapter, verses, isJst) {
        // default behavior = undefined, which won't load anything
        if (bookId !== undefined && chapter !== undefined) {
            let options = "";

            if (verses !== undefined) {
                options += verses;
            }

            if (isJst !== undefined) {
                options += "&jst=JST";
            }

            return `${URL_SCRIPTURES}?book=${bookId}&chap=${chapter}&verses${options}`
        }
    };

    getScripturesCallback = function (chapterHtml) {
        document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;
        setupMarkers()
    };

    getScripturesFailure = function () {
        document.getElementById(DIV_SCRIPTURES).innerHTML = "Unable to retrieve chapter content from server.";
    };

    htmlAnchor = function (volume) {
        return `<a name="${volume.id}" />`;
    };
    
    htmlDiv = function (parameters) {
        let classString = "";
        let contentString = "";
        let idString = "";
    
        if (parameters.classKey !== undefined) {
            classString = ` class="${parameters.classKey}"`;
        }
    
        if (parameters.content !== undefined) {
            contentString = parameters.content;
        }
    
        if (parameters.id !== undefined) {
            idString = ` id = "${parameters.id}"`;
        }
    
        return `<div${idString}${classString}>${contentString}</div>`;
    };
    
    htmlElement = function (tagName, content) {
        return `<${tagName}>${content}</${tagName}>`;
    };
    
    htmlLink = function (parameters) {
        let classString = "";
        let contentString = "";
        let hrefString = "";
        let idString = "";
    
        if (parameters.classKey !== undefined) {
            classString = ` class="${parameters.classKey}"`;
        }
    
        if (parameters.content !== undefined) {
            contentString = parameters.content;
        }
    
        if (parameters.href !== undefined) {
            hrefString = ` href="${parameters.href}"`;
        }
    
        if (parameters.id !== undefined) {
            idString = ` id="${parameters.id}"`;
        }
    
        return `<a${idString}${classString}${hrefString}>${contentString}</a>`;
    };
    
    htmlHashLink = function (hashArguments, content) {
        return `<a href="javascript:void(0)" onclick="changeHash(${hashArguments})">${content}</a>`;
    };

    init = function (callback) {
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax(URL_BOOKS, function (data) {
            books = data;
            booksLoaded = true;

            if (volumesLoaded) {
                cacheBooks(callback);
            }
        });
        ajax(URL_VOLUMES, function (data) {
            volumes = data;
            volumesLoaded = true;

            if (booksLoaded) {
                cacheBooks(callback);
            }
        });
    };

    navigateBook = function (bookId) {
        // go to the books object and find something that matches the bookId
        let book = books[bookId];

        // if it has more than one chapter, let the user choose which chapter; else, show content
        if (books.numChapters <= 1) {
            navigateChapter(bookId, book.numChapters)
        } else {
            document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv({
                id: DIV_SCRIPTURES_NAVIGATOR,
                content: chaptersGrid(book)
            });
        }
    };

    navigateChapter = function (bookId, chapter) {
        ajax(encodedScripturesURLParameters(bookId, chapter), getScripturesCallback, getScripturesFailure, true)
    };

    navigateHome = function (volumeId) {
        document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv({
            id: DIV_SCRIPTURES_NAVIGATOR,
            content: volumesGridContent(volumeId)
        });
    };

    nextChapter = function (bookId, chapter) {
        console.log("nextChapter() works");
        
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
    }

    onHashChanged = function () {
        let ids = [];

        // there is a location hash
        if (location.hash !== "" && location.hash.length > 1) {
            ids = location.hash.slice(1).split(":");
        }
        // length is less than 0
        if (ids.length <= 0) {
            navigateHome();
        // length is 1
        } else if (ids.length === 1) {
            let volumeId = Number(ids[INDEX_VOLUME]);

            if (volumeId < volumes[INDEX_VOLUME].id || volumeId > volumes.slice(-1)[INDEX_VOLUME].id) {
                // go home
                navigateHome();
            } else {
                // go home with volume id
                navigateHome(volumeId);
            }
        // length is greater than 2
        } else {
            let bookId = Number(ids[INDEX_BOOK]);

            if (books[bookId] === undefined) {
                navigateHome();
            } else {
                // go to the book
                if (ids.length === 2) {
                    navigateBook(bookId);
                // go to the book chapter
                } else {
                    let chapter = Number(ids[INDEX_CHAPTER]);

                    if (bookChapterValid(bookId, chapter)) {
                        navigateChapter(bookId, chapter);
                    } else {
                        navigateHome();
                    }
                }
            }
        }
    };

    // Book ID and chapter must be integers
    // Returns undefined if there is no previous chapter
    // Otherwise returns an array with the previous book ID, chapter, and title
    previousChapter = function (bookId, chapter) {
        // Get the book for the given bookId. if it exists (!== undefined):
        //      If chapter > 1, it's the easy case. Just return the same bookId,
        //          chapter - 1, and the title string for that book/chapter combo.
        //      Else: we need to see if there's a previous book:
        //          Get the book for bookId - 1. If it exists:
        //              Return bookId - 1, the lsat chapter of bookId/chapter/title,
        // If we didn't already return a 3-element array of bookId/chapter/title,
        //      at this point just drop through to the bottom of the function. We'll
        //      return undefined by default, meaning there is not previous chapter.
        
        console.log("previousChapter() works!")

        if (chapter.isInteger && bookId.isInteger) {
            let book = books[bookId];

            // if there are previous chapters (if it's not the first/only chapter)
            if (chapter > book.numChapters) {
                return [
                    bookId,
                    chapter - 1,
                    titleForBookChapter(book, chapter - 1)
                ];
            }
            
            // switch books, if it's the first/only chapter (or if there are no chapters)
            let prevBook = books[bookId - 1];

            if (prevBook !== undefined) {
                let prevChapterValue = 0;

                if (prevBook.numChapters > 0) {
                    prevChapterValue = 1;
                }

                return [
                    prevBook.id,
                    prevChapterValue,
                    titleForBookChapter(prevBook, prevChapterValue)
                ];
            }
        }

    }

    setupMarkers = function () {
        if (gmMarkers.length > 0) {
            clearMarkers();
        }
        
        document.querySelectorAll("a[onclick^=\"showLocation(\"]").forEach( function (element) {
            let matches = LAT_LONG_PARSER.exec(element.getAttribute("onclick"));

            // call add marker for each element
            if (matches) {
                let placename = matches[INDEX_PLACENAME];
                let latitude = matches[INDEX_LATITUDE];
                let longitude = matches[INDEX_LONGITUDE];
                let flag = matches[INDEX_FLAG];

                if (flag !== "") {
                    placename = `${placename} ${flag}`;
                }

                addMarker(placename, latitude, longitude);
            }
        });
    };

    showLocation = function (geotagId, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewAltitude, viewHeading) {
        map.setZoom(10);
        map.setCenter({ lat: viewLatitude, lng: viewLongitude });
    };

    testGeoplaces = function () {
        const similar = function (number1, number2) {
            return Math.abs(number1 - number2) < 0.0000001;
        };

        const matchingElement = function (array, object) {
            let match = null;

            array.forEach(element => {
                if (similar(element.latitude, object.latitude)
                    && similar(element.longitude, object.longitude)) {
                    if (match === null) {
                        match = element;
                    }
                }
            });

            return match;
        };

        const makeUniqueGeoPlaces = function (geoPlaces) {
            const uniqueGeoPlaces = [];

            geoPlaces.forEach(geoPlace => {
                const matchedElement = matchingElement(uniqueGeoPlaces, geoPlace);

                if (!matchedElement) {
                    uniqueGeoPlaces.push(geoPlace);
                } else {
                    if (!matchedElement.name.toLowerCase().includes(geoPlace.name.toLowerCase())) {
                        matchedElement.name = `${matchedElement.name}, ${geoPlace.name}`;
                    }
                }
            });

            console.log(uniqueGeoPlaces);

            return uniqueGeoPlaces;
        };

        makeUniqueGeoPlaces([
            { id: 536, name: "Hazor", latitude: 33.017181, longitude: 35.568048 },
            { id: 536, name: "Hazor", latitude: 33.017181, longitude: 35.568048 },
            { id: 536, name: "Hazor", latitude: 33.017181, longitude: 35.568048 },
            { id: 822, name: "Mount Halak", latitude: 30.916667, longitude: 34.833333 },
            { id: 1021, name: "Seir", latitude: 30.734691, longitude: 35.606250 },
            { id: 129, name: "Baal-gad", latitude: 33.416159, longitude: 35.857256 },
            { id: 1190, name: "Valley of Lebanon", latitude: 33.416159, longitude: 35.857256 },
            { id: 824, name: "Mount Hermon", latitude: 33.416159, longitude: 35.857256 },
        ]);
    };

    titleForBookChapter = function (book, chapter) {
        if (book !== undefined) {
            if (chapter > 0) {
                return `${book.tocName} ${chapter}`;
            }

            return book.tocName;
        }
    };

    volumesGridContent = function (volumeId) {
        let gridContent = "";

        volumes.forEach(function (volume) {
            if (volumeId === undefined || volumeId === volume.id) {
                gridContent += htmlDiv({
                    classKey: CLASS_VOLUME,
                    content: htmlAnchor(volume) + htmlElement(TAG_HEADER5, volume.fullName)
                });

                gridContent += booksGrid(volume);
            }
        });

        return gridContent + BOTTOM_PADDING;
    };

    /*-------------------------------------------------------------------
     *                      PUBLIC API
     */
    return {
        init,
        testGeoplaces,
        onHashChanged,
        nextChapter,
        previousChapter,
        showLocation
    };

}());
