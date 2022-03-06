/*========================================================================
 * FILE:    nextPreviousChapter.js
 * AUTHOR:  Tyler Smith
 * DATE:    Winter 2022
 *
 * DESCRIPTION: Smooth "next"/"previous" page transitions
 *              IS 542, Winter 2022, BYU.
 */
/*jslint
    browser, long
*/

$(function () {
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    // Constants
    const ANIMATION_DURATION = 350;
    const ANIMATION_TYPE_SLIDE_LEFT = "left";
    const ANIMATION_TYPE_SLIDE_RIGHT = "right";
    const POSITION_BEHIND_MAP = "100%";
    const POSITION_OFFSCREEN_LEFT = "-100%";
    const POSITION_VISIBLE = "0px";
    const OPAQUE = 1;
    const TRANSPARENT = 0;

    // Private Variables
    let visibleDiv = $("#chapter1");
    let invisibleDiv = $("#chapter2");
    let count = 1;

    // Helper methods
    const animateToNewContent = function (content, animationType) {
        invisibleDiv.html(content);
        
        if (animationType === ANIMATION_TYPE_SLIDE_LEFT) {
            slideFromLeft();
        } else if (animationType === ANIMATION_TYPE_SLIDE_RIGHT) {
            slideFromRight();
        } else {
            crossFade();
        }
    };

    const swapDivs = function() {
        let temp = visibleDiv;
        
        visibleDiv = invisibleDiv;
        invisibleDiv = temp;
    };

    const nextContent = function () {
        count += 1;
        return `The overall count is now <b>${count}</b>`;
    };

    const slideFromRight = function () {
        // make sure offscreen div is in right spot
        invisibleDiv.css({left: POSITION_BEHIND_MAP, opacity: OPAQUE});

        // run animation
        invisibleDiv.animate({left: POSITION_VISIBLE}, ANIMATION_DURATION);
        visibleDiv.animate({left: POSITION_OFFSCREEN_LEFT}, ANIMATION_DURATION, swapDivs);
    };

    const slideFromLeft = function () {
        // make sure offscreen div is in right spot
        invisibleDiv.css({left: POSITION_OFFSCREEN_LEFT, opacity: OPAQUE});

        // run animation
        invisibleDiv.animate({left: POSITION_VISIBLE}, ANIMATION_DURATION);
        visibleDiv.animate({left: POSITION_BEHIND_MAP}, ANIMATION_DURATION, swapDivs);
    };

    const crossFade = function () {
        // make sure invisible div is in the right spot
        invisibleDiv.css({left: POSITION_VISIBLE, opacity: TRANSPARENT});

        const hideIfTransparent = function () {
            swapDivs();
            invisibleDiv.css({left: POSITION_OFFSCREEN_LEFT});
        };
        
        // cross-fade the divs
        visibleDiv.animate({opacity: TRANSPARENT}, ANIMATION_DURATION);
        invisibleDiv.animate({opacity: OPAQUE}, ANIMATION_DURATION, hideIfTransparent);
    };

    // set up click handlers
    visibleDiv.click(() => {
        animateToNewContent(nextContent(), ANIMATION_TYPE_SLIDE_RIGHT);
    });
    invisibleDiv.click(() => {
        animateToNewContent(nextContent(), ANIMATION_TYPE_SLIDE_LEFT);
    });
    $(".map").click(() => {
        animateToNewContent(nextContent(), )
    });
});