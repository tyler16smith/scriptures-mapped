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
 *                      PUBLIC CODE
 */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
      'Scriptures.js',
      'HtmlHelper.js',
      'Breadcrumbs.js',
      '../index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  // ...
}