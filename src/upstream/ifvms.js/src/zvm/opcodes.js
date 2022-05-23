/*

Z-Machine opcodes
=================

Copyright (c) 2017 The ifvms.js team
MIT licenced
https://github.com/curiousdannii/ifvms.js

*/

'use strict';

/*

TODO:
	Abstract out the signed conversions such that they can be eliminated if possible
	don't access memory directly

*/

var AST = require( '../common/ast.js' ),
Variable = AST.Variable,
Opcode = AST.Opcode,
Stopper = AST.Stopper,
Pauser = AST.Pauser,
PauserStorer = AST.PauserStorer,
Brancher = AST.Brancher,
BrancherStorer = AST.BrancherStorer,
Storer = AST.Storer,
Caller = AST.Caller,
CallerStorer = AST.CallerStorer,
opcode_builder = AST.opcode_builder,

// Common functions, variables and opcodes
simple_func = function( a ) { return '' + a; },
stack_var = new Variable( this.e, 0 ),
alwaysbranch = opcode_builder( Brancher, function() { return 1; } ),
not = opcode_builder( Storer, function( a ) { return 'e.S2U(~' + a + ')'; } ),

// Indirect storer opcodes - rather non-generic I'm afraid
// Not used for inc/dec
// @load (variable) -> (result)
// @pull (variable)
// @store (variable) value
Indirect = Storer.subClass({
	storer: 0,

	post: function()
	{
		var operands = this.operands,
		op0 = operands[0],
		op0isVar = op0 instanceof Variable;

		// Replace the indirect operand with a Variable, and set .indirect if needed
		operands[0] = new Variable( this.e, op0isVar ? op0 : op0.v );
		if ( op0isVar || op0.v === 0 )
		{
			operands[0].indirect = 1;
		}

		// Get the storer
		this.storer = this.code === 142 ? operands.pop() : operands.shift();

		// @pull needs an added stack. If for some reason it was compiled with two operands this will break!
		if ( operands.length === 0 )
		{
			operands.push( stack_var );
		}
	},

	func: simple_func,
}),

Incdec = Opcode.subClass({
	func: function( variable )
	{
		var varnum = variable.v - 1,
		operator = this.code % 2 ? 1 : -1;

		// Fallback to the runtime function if our variable is a variable operand itself
		// Or, if it's a global
		if ( variable instanceof Variable || varnum > 14 )
		{
			return 'e.incdec(' + variable + ',' + operator + ')';
		}

		return ( varnum < 0 ? 'e.s[e.sp-1]' : 'e.l[' + varnum + ']' ) + ( operator === 1 ? '++' : '--' );
	},
}),

// Version 3 @save/restore branch instead of store
V3SaveRestore = Stopper.subClass({
	brancher: 1,

	toString: function()
	{
		return 'e.stop=1;e.' + ( this.code === 181 ? 'save' : 'restore' ) + '(' + ( this.pc + 1 ) + ')';
	},
}),

V45Restore = opcode_builder( PauserStorer, function() { return 'e.restore(' + ( this.next - 1 ) + ')'; } ),
V45Save = opcode_builder( PauserStorer, function() { return 'e.save(' + ( this.next - 1 ) + ')'; } );

/*eslint brace-style: "off" */
/*eslint indent: "off" */

module.exports = function( version )
{

return {

/* je */ 1: opcode_builder( Brancher, function() { return arguments.length === 2 ? this.args( '===' ) : 'e.jeq(' + this.args() + ')'; } ),
/* jl */ 2: opcode_builder( Brancher, function( a, b ) { return a.U2S() + '<' + b.U2S(); } ),
/* jg */ 3: opcode_builder( Brancher, function( a, b ) { return a.U2S() + '>' + b.U2S(); } ),
// Too many U2S/S2U for these...
/* dec_chk */ 4: opcode_builder( Brancher, function( variable, value ) { return 'e.U2S(e.incdec(' + variable + ',-1))<' + value.U2S(); } ),
/* inc_chk */ 5: opcode_builder( Brancher, function( variable, value ) { return 'e.U2S(e.incdec(' + variable + ',1))>' + value.U2S(); } ),
/* jin */ 6: opcode_builder( Brancher, function() { return 'e.jin(' + this.args() + ')'; } ),
/* test */ 7: opcode_builder( Brancher, function() { return 'e.test(' + this.args() + ')'; } ),
/* or */ 8: opcode_builder( Storer, function() { return this.args( '|' ); } ),
/* and */ 9: opcode_builder( Storer, function() { return this.args( '&' ); } ),
/* test_attr */ 10: opcode_builder( Brancher, function() { return 'e.test_attr(' + this.args() + ')'; } ),
/* set_attr */ 11: opcode_builder( Opcode, function() { return 'e.set_attr(' + this.args() + ')'; } ),
/* clear_attr */ 12: opcode_builder( Opcode, function() { return 'e.clear_attr(' + this.args() + ')'; } ),
/* store */ 13: Indirect,
/* insert_obj */ 14: opcode_builder( Opcode, function() { return 'e.insert_obj(' + this.args() + ')'; } ),
/* loadw */ 15: opcode_builder( Storer, function( array, index ) { return 'e.m.getUint16(e.S2U(' + array + '+2*' + index.U2S() + '))'; } ),
/* loadb */ 16: opcode_builder( Storer, function( array, index ) { return 'e.m.getUint8(e.S2U(' + array + '+' + index.U2S() + '))'; } ),
/* get_prop */ 17: opcode_builder( Storer, function() { return 'e.get_prop(' + this.args() + ')'; } ),
/* get_prop_addr */ 18: opcode_builder( Storer, function() { return 'e.find_prop(' + this.args() + ')'; } ),
/* get_next_prop */ 19: opcode_builder( Storer, function() { return 'e.find_prop(' + this.args( ',0,' ) + ')'; } ),
/* add */ 20: opcode_builder( Storer, function() { return 'e.S2U(' + this.args( '+' ) + ')'; } ),
/* sub */ 21: opcode_builder( Storer, function() { return 'e.S2U(' + this.args( '-' ) + ')'; } ),
/* mul */ 22: opcode_builder( Storer, function() { return 'e.S2U(' + this.args( '*' ) + ')'; } ),
/* div */ 23: opcode_builder( Storer, function( a, b ) { return 'e.S2U(parseInt(' + a.U2S() + '/' + b.U2S() + '))'; } ),
/* mod */ 24: opcode_builder( Storer, function( a, b ) { return 'e.S2U(' + a.U2S() + '%' + b.U2S() + ')'; } ),
/* call_2s */ 25: CallerStorer,
/* call_2n */ 26: Caller,
/* set_colour */ 27: opcode_builder( Opcode, function() { return 'e.set_colour(' + this.args() + ')'; } ),
/* throw */ 28: opcode_builder( Stopper, function( value, cookie ) { return 'while(e.frames.length+1>' + cookie + '){e.frameptr=e.frames.pop()}return ' + value; } ),
/* jz */ 128: opcode_builder( Brancher, function( a ) { return a + '===0'; } ),
/* get_sibling */ 129: opcode_builder( BrancherStorer, function( obj ) { return 'e.get_sibling(' + obj + ')'; } ),
/* get_child */ 130: opcode_builder( BrancherStorer, function( obj ) { return 'e.get_child(' + obj + ')'; } ),
/* get_parent */ 131: opcode_builder( Storer, function( obj ) { return 'e.get_parent(' + obj + ')'; } ),
/* get_prop_length */ 132: opcode_builder( Storer, function( a ) { return 'e.get_prop_len(' + a + ')'; } ),
/* inc */ 133: Incdec,
/* dec */ 134: Incdec,
/* print_addr */ 135: opcode_builder( Opcode, function( addr ) { return 'e.print(2,' + addr + ')'; } ),
/* call_1s */ 136: CallerStorer,
/* remove_obj */ 137: opcode_builder( Opcode, function( obj ) { return 'e.remove_obj(' + obj + ')'; } ),
/* print_obj */ 138: opcode_builder( Opcode, function( obj ) { return 'e.print(3,' + obj + ')'; } ),
/* ret */ 139: opcode_builder( Stopper, function( a ) { return 'return ' + a; } ),
/* jump */ 140: opcode_builder( Stopper, function( a ) { return 'e.pc=' + a.U2S() + '+' + ( this.next - 2 ); } ),
/* print_paddr */ 141: opcode_builder( Opcode, function( addr ) { return 'e.print(2,' + addr + '*' + this.e.addr_multipler + ')'; } ),
/* load */ 142: Indirect.subClass( { storer: 1 } ),
143: version < 5 ?
	/* not (v3/4) */ not :
	/* call_1n (v5/8) */ Caller,
/* rtrue */ 176: opcode_builder( Stopper, function() { return 'return 1'; } ),
/* rfalse */ 177: opcode_builder( Stopper, function() { return 'return 0'; } ),
// Reconsider a generalised class for @print/@print_ret?
/* print */ 178: opcode_builder( Opcode, function( text ) { return 'e.print(2,' + text + ')'; }, { printer: 1 } ),
/* print_ret */ 179: opcode_builder( Stopper, function( text ) { return 'e.print(2,' + text + ');e.print(1,13);return 1'; }, { printer: 1 } ),
/* nop */ 180: Opcode,
/* save (v3/4) */ 181: version < 4 ?
	V3SaveRestore :
	V45Save,
/* restore(v3/4) */ 182: version < 4 ?
	V3SaveRestore :
	V45Restore,
/* restart */ 183: opcode_builder( Stopper, function() { return 'e.restart()'; } ),
/* ret_popped */ 184: opcode_builder( Stopper, function( a ) { return 'return ' + a; }, { post: function() { this.operands.push( stack_var ); } } ),
185: version < 5 ?
	/* pop (v3/4) */ opcode_builder( Opcode, function() { return 's[--e.sp]'; } ) :
	/* catch (v5/8) */ opcode_builder( Storer, function() { return 'e.frames.length+1'; } ),
/* quit */ 186: opcode_builder( Pauser, function() { return 'e.quit=1;e.Glk.glk_exit()'; } ),
/* new_line */ 187: opcode_builder( Opcode, function() { return 'e.print(1,13)'; } ),
188: version < 4 ?
	/* show_status (v3) */ opcode_builder( Stopper, function() { return 'e.pc=' + this.next + ';e.v3_status()'; } ) :
	/* act as a nop in later versions */ Opcode,
/* verify */ 189: alwaysbranch, // Actually check??
/* piracy */ 191: alwaysbranch,
/* call_vs */ 224: CallerStorer,
/* storew */ 225: opcode_builder( Opcode, function( array, index, value ) { return 'e.ram.setUint16(e.S2U(' + array + '+2*' + index.U2S() + '),' + value + ')'; } ),
/* storeb */ 226: opcode_builder( Opcode, function( array, index, value ) { return 'e.ram.setUint8(e.S2U(' + array + '+' + index.U2S() + '),' + value + ')'; } ),
/* put_prop */ 227: opcode_builder( Opcode, function() { return 'e.put_prop(' + this.args() + ')'; } ),
/* read */ 228: version < 5 ?
	opcode_builder( Pauser, function() { return 'e.read(0,' + this.args() + ')'; } ) :
	opcode_builder( PauserStorer, function() { return 'e.read(' + this.storer.v + ',' + this.args() + ')'; } ),
/* print_char */ 229: opcode_builder( Opcode, function( a ) { return 'e.print(4,' + a + ')'; } ),
/* print_num */ 230: opcode_builder( Opcode, function( a ) { return 'e.print(0,' + a.U2S() + ')'; } ),
/* random */ 231: opcode_builder( Storer, function( a ) { return 'e.random(' + a.U2S() + ')'; } ),
/* push */ 232: opcode_builder( Storer, simple_func, { post: function() { this.storer = stack_var; }, storer: 0 } ),
/* pull */ 233: Indirect,
/* split_window */ 234: opcode_builder( Opcode, function( lines ) { return 'e.split_window(' + lines + ')'; } ),
/* set_window */ 235: opcode_builder( Opcode, function( wind ) { return 'e.set_window(' + wind + ')'; } ),
/* call_vs2 */ 236: CallerStorer,
/* erase_window */ 237: opcode_builder( Opcode, function( win ) { return 'e.erase_window(' + win.U2S() + ')'; } ),
/* erase_line */ 238: opcode_builder( Opcode, function( a ) { return 'e.erase_line(' + a + ')'; } ),
/* set_cursor */ 239: opcode_builder( Opcode, function( row, col ) { return 'e.set_cursor(' + row + '-1,' + col + '-1)'; } ),
/* get_cursor */ 240: opcode_builder( Opcode, function( addr ) { return 'e.get_cursor(' + addr + ')'; } ),
/* set_text_style */ 241: opcode_builder( Opcode, function( stylebyte ) { return 'e.set_style(' + stylebyte + ')'; } ),
/* buffer_mode */ 242: Opcode, // We don't support non-buffered output
/* output_stream */ 243: opcode_builder( Stopper, function() { return 'e.pc=' + this.next + ';e.output_stream(' + this.args() + ')'; } ),
/* input_stream */ 244: opcode_builder( Pauser, function() { return 'e.input_stream(' + this.args() + ')'; } ),
/* sound_effect */ 245: Opcode, // We don't support sounds
/* read_char */ 246: opcode_builder( PauserStorer, function() { return 'e.read_char(' + this.storer.v + ',' + ( this.args() || '1' ) + ')'; } ),
/* scan_table */ 247: opcode_builder( BrancherStorer, function() { return 'e.scan_table(' + this.args() + ')'; } ),
/* not (v5/8) */ 248: not,
/* call_vn */ 249: Caller,
/* call_vn2 */ 250: Caller,
/* tokenise */ 251: opcode_builder( Opcode, function() { return 'e.tokenise(' + this.args() + ')'; } ),
/* encode_text */ 252: opcode_builder( Opcode, function() { return 'e.encode_text(' + this.args() + ')'; } ),
/* copy_table */ 253: opcode_builder( Opcode, function() { return 'e.copy_table(' + this.args() + ')'; } ),
/* print_table */ 254: opcode_builder( Opcode, function() { return 'e.print_table(' + this.args() + ')'; } ),
/* check_arg_count */ 255: opcode_builder( Brancher, function( arg ) { return 'e.stack.getUint8(e.frameptr+5)&(1<<(' + arg + '-1))'; } ),
/* save */ 1000: V45Save,
/* restore */ 1001: V45Restore,
/* log_shift */ 1002: opcode_builder( Storer, function( a, b ) { return 'e.S2U(e.log_shift(' + a + ',' + b.U2S() + '))'; } ),
/* art_shift */ 1003: opcode_builder( Storer, function( a, b ) { return 'e.S2U(e.art_shift(' + a.U2S() + ',' + b.U2S() + '))'; } ),
/* set_font */ 1004: opcode_builder( Storer, function( font ) { return 'e.set_font(' + font + ')'; } ),
/* save_undo */ 1009: opcode_builder( Storer, function() { return 'e.save_undo(' + this.next + ',' + this.storer.v + ')'; } ),
// As the standard says calling this without a save point is illegal, we don't need to actually store anything (but it must still be disassembled)
/* restore_undo */ 1010: opcode_builder( Opcode, function() { return 'if(e.restore_undo())return'; }, { storer: 1 } ),
/* print_unicode */ 1011: opcode_builder( Opcode, function( a ) { return 'e.print(1,' + a + ')'; } ),
// Assume we can print and read all unicode characters rather than actually testing
/* check_unicode */ 1012: opcode_builder( Storer, function() { return 3; } ),
/* set_true_colour */ 1013: opcode_builder( Opcode, function() { return 'e.set_true_colour(' + this.args() + ')'; } ),
/* sound_data */ 1014: Opcode.subClass( { brancher: 1 } ), // We don't support sounds (but disassemble the branch address)
/* gestalt */ 1030: opcode_builder( Storer, function() { return 'e.gestalt(' + this.args() + ')'; } ),
/* parchment */ //1031: opcode_builder( Storer, function() { return 'e.op_parchment(' + this.args() + ')'; } ),

};

};
