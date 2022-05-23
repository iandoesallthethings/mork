/* rgstyle.c: Style formatting hints.
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include "glk.h"
#include "remglk.h"
#include "rgdata.h"
#include "rgwin_grid.h"
#include "rgwin_buf.h"

/*

TODO:
- autosave stylehints
- send live updated page background colour

*/

glsi32 stylehints[2][style_NUMSTYLES][stylehint_NUMHINTS];

void gli_initialize_stylehints()
{
    for (int wintype = 0; wintype < 2; wintype++) {
        for (int style = 0; style < style_NUMSTYLES; style++) {
            for (int stylehint = 0; stylehint < stylehint_NUMHINTS; stylehint++) {
                stylehints[wintype][style][stylehint] = MAGIC_STYLEHINT_UNSET;
            }
        }
    }
}

void glk_stylehint_set(glui32 wintype, glui32 styl, glui32 hint, 
    glsi32 val)
{
    if (styl >= style_NUMSTYLES || hint >= stylehint_NUMHINTS) {
        return;
    }

    if (wintype == wintype_AllTypes || wintype == wintype_TextBuffer) {
        stylehints[STYLEHINTS_BUFFER][styl][hint] = val;
    }
    if (wintype == wintype_AllTypes || wintype == wintype_TextGrid) {
        stylehints[STYLEHINTS_GRID][styl][hint] = val;
    }
}

void glk_stylehint_clear(glui32 wintype, glui32 styl, glui32 hint)
{
    if (styl >= style_NUMSTYLES || hint >= stylehint_NUMHINTS) {
        return;
    }

    if (wintype == wintype_AllTypes || wintype == wintype_TextBuffer) {
        stylehints[STYLEHINTS_BUFFER][styl][hint] = MAGIC_STYLEHINT_UNSET;
    }
    if (wintype == wintype_AllTypes || wintype == wintype_TextGrid) {
        stylehints[STYLEHINTS_GRID][styl][hint] = MAGIC_STYLEHINT_UNSET;
    }
}

glui32 glk_style_distinguish(window_t *win, glui32 styl1, glui32 styl2)
{
    if (!win) {
        gli_strict_warning("style_distinguish: invalid ref");
        return FALSE;
    }
    
    if (styl1 >= style_NUMSTYLES || styl2 >= style_NUMSTYLES)
        return FALSE;
    
    /* ### */
    
    return FALSE;
}

glui32 glk_style_measure(window_t *win, glui32 styl, glui32 hint, 
    glui32 *result)
{
    glui32 dummy;

    if (!win) {
        gli_strict_warning("style_measure: invalid ref");
        return FALSE;
    }
    
    if (styl >= style_NUMSTYLES || hint >= stylehint_NUMHINTS)
        return FALSE;
    
    if (!result)
        result = &dummy;

    /* ### */    
    
    return FALSE;
}
