/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

// Wrap our code in a closure to avoid global pollution
(function() {

  // create one global "tero" object that contains our game
  var tetro = window.tetro = { };
  
  // link our functions to our exposed object
  tetro.clamp = clamp;
  tetro.setup = setup;
  tetro.initializeData = initializeData;
  tetro.array2d = array2d;
  tetro.arrayRow = arrayRow;
  tetro.draw = draw;
  tetro.foreachShapeCell = foreachShapeCell;
  tetro.foreachFieldCell = foreachFieldCell;
  tetro.foreachFieldRow = foreachFieldRow;
  tetro.moveShape = moveShape;
  tetro.rotateShape = rotateShape;
  tetro.update = update;
  tetro.dirtyShape = dirtyShape;
  tetro.handleKeyboardDown = handleKeyboardDown;
  tetro.inbounds = inbounds;
  tetro.hitsolid = hitsolid;
  tetro.solidify = solidify;
  tetro.clearlines = clearlines;
  tetro.nextShape = nextShape;
  tetro.buildHTMLTable = buildHTMLTable;
  
  /**
   * helper to limit a value to a minimum and maximum.
   */
  function clamp (min, value, max) {
    return Math.min (Math.max (value, min), max);
  }
  

  /**
   * a helper function to create a square 2-dimensional array.
   */
  function array2d (value) {
    var data = [ ];
    for (var i=0; i<this.height; i++) {
      data[i] = [ ];
      for (var n=0; n<this.width; n++) {
        data[i].push(value);
      }
    }
    return data;
  }
  
  
  /**
   * a helper function to create a row array.
   */
  function arrayRow (value) {
    var arr = new Array(tetro.width);
    arr.fill(value);
    return arr;
  }
  
  
  /**
   * helper function to loop over each cell in a shape.
   * 
   * shape: matrix definition
   * position: { row, col }
   * func: called against each cell, takes (position, value)
   *       where the position is relative to the playfield.
   */
  function foreachShapeCell (shape, position, func) {
    if (shape == undefined) return console.warn ('shape is undefined');
    if (position == undefined) return console.warn ('position is undefined');
    for (var col=0; col<shape.length; col++) {
      for (var row=0; row<shape[col].length; row++) {
        var loopPos = {
          row: row + position.row,
          col: col + position.col
        }
        var result = func (loopPos, shape[row][col]);
        if (result != undefined) return result;
      }
    }
  }
  
  
  /**
   * helper function to loop over each cell in the play field.
   */
  function foreachFieldCell (func) {
    for (var row=0; row<this.height; row++) {
      for (var col=0; col<this.width; col++) {
        func (row, col);
      }
    }
  }
  
  /**
   * helper function to loop over each row in the play field.
   */
  function foreachFieldRow (func) {
    for (var row=0; row<this.height; row++) {
      func (row);
    }
  }
  
  
  // define game logic
  function setup () {
    
    // play field dimensions
    this.width = 10;
    this.height = 22;
    
    // prepare game data and view
    this.initializeData();
    this.buildHTMLTable();
    
    // attach controller
    window.addEventListener(
      "keydown", tetro.handleKeyboardDown, false
    );

    // render timer
    var that = this;
    //window.setInterval(function() { that.draw() }, 100);
    window.setInterval(function() { that.update() }, 1000);
    
    console.log ('game loaded');
  }
  
  // initialize game data
  function initializeData () {
    
    // index playfield positions via a 2-dimensional array: [row][col]
    //this.data = this.array2d(0);
    
    // store fixed shapes that become part of the play field when dropped
    this.fixed = this.array2d(0);
    
    // track dirty positions: those changed during an update
    this.dirty = this.array2d(true);
    
    // load preset shapes
    this.shapes = [ ];
    
    // block
    this.shapes.push(
      [[4, 4],
       [4, 4]
       ]
    );
    
    // L
    this.shapes.push(
      [[0, 8, 0, 0],
       [0, 8, 0, 0],
       [0, 8, 0, 0],
       [0, 8, 8, 0],
       ]
    );
    
    // T
    this.shapes.push(
      [[9, 9, 9],
       [0, 9, 0],
       [0, 0, 0]
       ]
    );
    
    // long
    this.shapes.push(
      [[0, 2, 0, 0],
       [0, 2, 0, 0],
       [0, 2, 0, 0],
       [0, 2, 0, 0],
       ]
    );

    // z
    this.shapes.push(
      [[0, 0, 3, 0],
       [0, 3, 3, 0],
       [0, 3, 0, 0],
       [0, 0, 0, 0],
       ]
    );

    // s
    this.shapes.push(
      [[0, 6, 0, 0],
       [0, 6, 6, 0],
       [0, 0, 6, 0],
       [0, 0, 0, 0],
       ]
    );

    // preset colours
    this.colours = [
      '#002b36',    // 0 background
      '#93a1a1',    // 1 gray
      '#dc322f',    // 2 red
      '#859900',    // 3 green
      '#268bd2',    // 4 blue
      '#b58900',    // 5 yellow
      '#2aa198',    // 6 cyan
      '#6c71c4',    // 7 violet
      '#cb4b16',    // 8 orange
      '#d33682',    // 9 magenta
    ];
    
    this.nextShape();
    
  }
  
  
  // keyboard controls
  function handleKeyboardDown (event) {
    
    var left = 37;
    var up = 38;
    var right = 39;
    var down = 40;
    
    if (event.keyCode == left) {
      tetro.moveShape (0, -1);
    }
    if (event.keyCode == right) {
      tetro.moveShape (0, 1);
    }
    if (event.keyCode == up) {
      tetro.rotateShape();
    }
    if (event.keyCode == down) {
      tetro.moveShape (1, 0);
    }
  }
  
  // create a html table to display our game
  function buildHTMLTable () {
    
    // store the view cells in an array for quick access
    var view = this.view = [ ];
    
    // create a html table
    var table = document.createElement('table');
    table.style.borderSpacing = '0';
    table.setAttribute('border', '0');
    table.setAttribute('cellpadding', '0');
    
    for (var i=0; i<this.height; i++) {
      
      var row = document.createElement('tr');

      // fill rows with empty values
      view[i] = [ ];
      
      for (var n=0; n<this.width; n++) {
        var cell = document.createElement('td');
        //cell.textContent = 'X';
        cell.style.border = 'solid 1px #073642';
        //cell.style.backgroundColor = 'black';
        cell.style.color = '';
        cell.style.width = '15px';
        cell.style.height = '15px';
        view[i].push(cell);
        row.appendChild(cell);
      }
      
      table.appendChild(row);
    }
    
    document.body.appendChild(table);
  }
  
  
  // update piece
  function update () {
    
    tetro.moveShape (1, 0);

  }
  
  
  /**
   * Draws the play field and current shape.
   */
  function draw () {

    // play field
    tetro.foreachFieldCell (function (row, col) {
        
      // only bother drawing dirty cells
      if (tetro.dirty[row][col] == true) {
        
        var playfieldValue = tetro.fixed[row][col];
        var colour = tetro.colours[playfieldValue];
        
        // set background colour
        tetro.view[row][col].style.backgroundColor = colour;
        
        // clean
        tetro.dirty[row][col] = false;
        
      }
    });
    
    // draw the current shape
    tetro.foreachShapeCell (tetro.current, tetro.position, function (position, value) {
      if (value > 0) {
        tetro.view[position.row][position.col].style.backgroundColor = tetro.colours[value];
      }
    });
    
  }
  
  
  /**
   * mark the positions of the current shape dirty
   * so that they redraw.
   */
  function dirtyShape () {
    tetro.foreachShapeCell (tetro.current, tetro.position, function (position, value) {
      if (value > 0) {
        tetro.dirty[position.row][position.col] = true;
      }
    });
  }


  /**
   * tests if a shape fits in the play field.
   * note that position can be negative, we check the value of
   * the cells, and ignore empty cels. this allows a piece to
   * move right up against the edge, even if that cell is out
   * of bounds.
   */
  function inbounds (shape, position) {
    
    var valid = tetro.foreachShapeCell (shape, position, function (position, value) {
        // limit left position
        if (value > 0 && position.col < 0) return false;
        // limit right position
        if (value > 0 && position.col >= tetro.width) return false;
    });
    
    // default true if no value was returned
    return valid == undefined ? true : valid;
    
  }
  
  
  // tests if a piece and position hits a solid on the fixed matrix
  function hitsolid (shape, position) {

    var hit = tetro.foreachShapeCell (shape, position, function (position, value) {

      // the bottom line is considered solid, if the shape has a value there
      if (value > 0 && position.row == tetro.height) return true;
      
      // clamp to limits, zero based
      var fixrow = tetro.clamp(0, position.row, tetro.height - 1);
      var fixcol = tetro.clamp(0, position.col, tetro.width - 1);
      
      // the value in the play field
      var fixvalue = tetro.fixed[fixrow][fixcol];
      if (value > 0 && fixvalue > 0) return true;
    });
    
    return hit || false;
  }
  
  
  /**
   * merge the current shape into the play field.
   */
  function solidify () {
    
    var shape = tetro.current;
    var position = tetro.position;
    tetro.current = undefined;
    
    tetro.foreachShapeCell (shape, position, function (position, value) {
      // only fix valid values, do not blank out existing
      if (value > 0) {
        tetro.fixed[position.row][position.col] = 1;  // use value to preserve colour
      }
    });
    
    tetro.clearlines();
  }
  
  
  /**
   * clears any completed lines.
   */
  function clearlines () {

    var count = 0;
    
    tetro.foreachFieldRow(function (row) {
      
      var rowarray = tetro.fixed[row];
      
      var isfull = rowarray.every(function (item) {
          return item > 0;
        });
      
      if (isfull) {
        
        count++;
        
        // remove full row
        tetro.fixed.splice(row, 1);
        
        // shift a new row in the top
        tetro.fixed.unshift(tetro.arrayRow(0));
        
      }
      
    });
    
    // mark the entire field dirty for redraw
    if (count > 0) {
      tetro.dirty = tetro.array2d(true);
    }
  
  }
  
  
  /**
   * choose a new piece and reset position.
   */
  function nextShape () {
    
    // reshape
    var index = Math.floor(Math.random() * tetro.shapes.length);
    var shape = tetro.shapes[index];

    // reposition
    var newpos = {
      row: 0,
      col: Math.floor(tetro.width/2) - Math.floor(shape.length/2)
    }
    
    // if we hit a solid now, game over
    var hit = tetro.hitsolid (shape, newpos);

    if (hit) {
      tetro.initializeData();
    }
    
    tetro.position = newpos;
    tetro.current = shape;
  }
  
  
  // move the current piece position
  function moveShape (row, col) {
    
    if (tetro.current == undefined) return;
    
    tetro.dirtyShape();
    
    // new position
    var newpos = {
      row: tetro.position.row + row,
      col: tetro.position.col + col
    }
    
    var hit = tetro.hitsolid(tetro.current, newpos);
    
    // the piece has hit something hard while moving down
    if (row > 0) {
      if (hit) {
        tetro.solidify();
        tetro.nextShape();
        tetro.draw();
        return;
      }
    }
    
    var validbounds = tetro.inbounds(tetro.current, newpos);
    if (validbounds && !hit) tetro.position = newpos;
    tetro.draw();
    
  }
  
  
  /**
   * turn the current shape.
   */
  function rotateShape () {
    
    var a = tetro.current;
    
    a = Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
    for (i in a){
      a[i] = a[i].reverse();
    }
    
    // test if the rotated shape is in bounds and hits anything
    var hit = tetro.hitsolid(a, tetro.position);
    var validbounds = tetro.inbounds(a, tetro.position);
    
    if (validbounds && !hit) {
      tetro.dirtyShape();
      tetro.current = a;
      tetro.draw();
    }
  }
  
  
  // begin here
  tetro.setup();

})();
