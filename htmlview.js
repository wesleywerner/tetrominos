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

  var tetro = window.tetro;
  if (tetro == undefined) console.warn ('no tetro object found. please load teromino.js first!');
  

  // create a html table to display our game
  function buildHTMLTable () {
    
    // prevent recreating this table for subsequent games
    if (tetro.view != undefined) return;
    
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


  /**
   * Draws the play field and current shape.
   */
  function updateHTMLTable () {

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
   * Display the current score.
   */
  function displayScore (score) {
    document.getElementById('score').innerHTML = score.toString();
  }


  /**
   * keyboard controls.
   */
  function handleKeyDown (event) {
    
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
  
  window.addEventListener(
    "keydown", handleKeyDown, false
  );

  // hook into the redraw and init callbacks
  tetro.redraw = updateHTMLTable;  
  tetro.initializeView = buildHTMLTable;
  tetro.scored = displayScore;
  tetro.setup();
  
})();
