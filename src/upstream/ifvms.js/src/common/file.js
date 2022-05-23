/*

File classes
============

Copyright (c) 2016 The ifvms.js team
BSD licenced
http://github.com/curiousdannii/ifvms.js

*/

'use strict';

var utils = require( './utils.js' ),
MemoryView = utils.MemoryView,

// A basic IFF file, to be extended later
// Currently supports buffer data
IFF = utils.Class.subClass({
	init: function( data )
	{
		this.type = '';
		this.chunks = [];
		
		if ( data )
		{
			var view = MemoryView( data ),
			i = 12, length, chunk_length;
			
			// Check that it is actually an IFF file
			if ( view.getFourCC( 0 ) !== 'FORM' )
			{
				throw new Error( 'Not an IFF file' );
			}

			// Parse the file
			this.type = view.getFourCC( 8 );
			length = view.getUint32( 4 ) + 8;

			while ( i < length )
			{
				chunk_length = view.getUint32( i + 4 );

				if ( chunk_length < 0 || ( chunk_length + i ) > length )
				{
					throw new Error( 'IFF chunk out of range' );
				}

				this.chunks.push({
					type: view.getFourCC( i ),
					offset: i,
					data: view.getUint8Array( i + 8, chunk_length ),
				});

				i += 8 + chunk_length;
				if ( chunk_length % 2 )
				{
					i++;
				}
			}
		}
	},

	write: function()
	{
		// Start with the IFF type
		var buffer_len = 12, i = 0, index = 12,
		out, chunk;

		// First calculate the required buffer length
		while ( i < this.chunks.length )
		{
			// Replace typed arrays or dataviews with their buffers
			if ( this.chunks[i].data.buffer )
			{
				this.chunks[i].data = this.chunks[i].data.buffer;
			}
			this.chunks[i].length = this.chunks[i].data.byteLength || this.chunks[i].data.length;
			buffer_len += 8 + this.chunks[i++].length;
			if ( buffer_len % 2 )
			{
				buffer_len++;
			}
		}
		
		out = MemoryView( buffer_len );
		out.setFourCC( 0, 'FORM' );
		out.setUint32( 4, buffer_len - 8 );
		out.setFourCC( 8, this.type );
		
		// Go through the chunks and write them out
		i = 0;
		while ( i < this.chunks.length )
		{
			chunk = this.chunks[i++];
			out.setFourCC( index, chunk.type );
			out.setUint32( index + 4, chunk.length );
			out.setUint8Array( index + 8, chunk.data );
			index += 8 + chunk.length;
			if ( index % 2 )
			{
				index++;
			}
		}

		return out.buffer;
	},
}),

Blorb = IFF.subClass({
	init: function( data )
	{
		this.super.init.call( this, data );
		if ( data )
		{
			if ( this.type !== 'IFRS' )
			{
				throw new Error( 'Not a Blorb file' );
			}
			
			// Process the RIdx chunk to find the main exec chunk
			if ( this.chunks[0].type !== 'RIdx' )
			{
				throw new Error( 'Malformed Blorb: chunk 1 is not RIdx' );
			}
			var view = MemoryView( this.chunks[0].data ),
			i = 4;
			while ( i < this.chunks[0].data.length )
			{
				if ( view.getFourCC( i ) === 'Exec' && view.getUint32( i + 4 ) === 0 )
				{
					this.exec = this.chunks.filter( function( chunk )
					{
						return chunk.offset === view.getUint32( i + 8 );
					})[0];
					return;
				}
				i += 12;
			}
		}
	},
}),

Quetzal = IFF.subClass({
	// Parse a Quetzal savefile, or make a blank one
	init: function( data )
	{
		this.super.init.call( this, data );
		if ( data )
		{
			// Check this is a Quetzal savefile
			if ( this.type !== 'IFZS' )
			{
				throw new Error( 'Not a Quetzal savefile' );
			}

			// Go through the chunks and extract the useful ones
			var i = 0,
			type, chunk_data, view;
			
			while ( i < this.chunks.length )
			{
				type = this.chunks[i].type;
				chunk_data = this.chunks[i++].data;

				// Memory and stack chunks
				if ( type === 'CMem' || type === 'UMem' )
				{
					this.memory = chunk_data;
					this.compressed = ( type === 'CMem' );
				}
				else if ( type === 'Stks' )
				{
					this.stacks = chunk_data;
				}

				// Story file data
				else if ( type === 'IFhd' )
				{
					view = MemoryView( chunk_data.buffer );
					this.release = view.getUint16( 0 );
					this.serial = view.getUint8Array( 2, 6 );
					// The checksum isn't used, but if we throw it away we can't round-trip
					this.checksum = view.getUint16( 8 );
					// The pc is only a Uint24, but there's no function for that, so grab an extra byte and then discard it
					this.pc = view.getUint32( 9 ) & 0xFFFFFF;
				}
			}
		}
	},

	// Write out a savefile
	write: function()
	{
		// Reset the IFF type
		this.type = 'IFZS';

		// Format the IFhd chunk correctly
		var ifhd = MemoryView( 13 );
		ifhd.setUint16( 0, this.release );
		ifhd.setUint8Array( 2, this.serial );
		ifhd.setUint32( 9, this.pc );
		ifhd.setUint16( 8, this.checksum );

		// Add the chunks
		this.chunks = [
			{ type: 'IFhd', data: ifhd },
			{ type: ( this.compressed ? 'CMem' : 'UMem' ), data: this.memory },
			{ type: 'Stks', data: this.stacks },
		];

		// Return the byte array
		return this.super.write.call( this );
	},
});

// Inspect a file and identify its format and version number
function identify( buffer )
{
	var view = MemoryView( buffer ),
	blorb,
	format,
	version;
	
	// Blorb
	if ( view.getFourCC( 0 ) === 'FORM' && view.getFourCC( 8 ) === 'IFRS' )
	{
		blorb = new Blorb( buffer );
		if ( blorb.exec )
		{
			format = blorb.exec.type;
			buffer = blorb.exec.data;
			if ( format === 'GLUL' )
			{
				view = MemoryView( buffer );
				version = view.getUint32( 4 );
			}
			if ( format === 'ZCOD' )
			{
				version = buffer[0];
			}
		}
	}
	// Glulx
	else if ( view.getFourCC( 0 ) === 'Glul' )
	{
		format = 'GLUL';
		version = view.getUint32( 4 );
	}
	// Z-Code
	else
	{
		version = view.getUint8( 0 );
		if ( version > 0 && version < 9 )
		{
			format = 'ZCOD';
		}
	}
	
	if ( format && version )
	{
		return {
			format: format,
			version: version,
			data: buffer,
		};
	}
}

module.exports = {
	IFF: IFF,
	Blorb: Blorb,
	Quetzal: Quetzal,
	identify: identify,
};
