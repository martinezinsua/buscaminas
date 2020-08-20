const DEFAULT_CELL_VALUE = 0;
const NONE = 0;
const FLAG = 1;
const QUESTION = 2;

let time = 0;
let flags = 0;
let timer = undefined;
let buscaminas;

class Cell {
    constructor(x, y, value, flag, is_shown) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.flag = flag;
        this.is_shown = is_shown;
    }

    get is_bomb() {
        return this.value === 9;
    }

    get_style() {
        let color = '';
        let iclasses = '';
        let bgcolor = '';
        let classes = 'btn btn-outline-secondary cell';
        let id = `${this.x}_${this.y}`;
        let value = '';

        if(this.is_shown) {
            bgcolor = 'white';
            value = this.value;
            switch(this.value){
                case 1: color = 'blue'; break;
                case 2: color = 'green'; break;
                case 3: color = 'red'; break;
                case 4: color = 'orange'; break;
                case 5: color = 'purple'; break;
                case 6: color = 'darkkhaki'; break;
                case 7: color = 'fuchsia'; break;
                case 8: color = 'olive'; break;
                case 9: color = 'black'; bgcolor= 'orangered'; iclasses = 'fas fa-bomb'; value = ''; break;
            }
            
        } else {
            classes += ' cell-hidden';
            color = 'black';
            bgcolor = 'lightgray';
            switch(this.flag) {
                case NONE: iclasses = ''; break;
                case FLAG: iclasses = 'fas fa-flag'; break;
                case QUESTION: iclasses = 'fas fa-question'; break;
            }
            value = '';
        }

        return {
            iclasses: iclasses,
            classes: classes,
            id:id,
            color:color,
            bgcolor: bgcolor,
            value: value
        };      
    }

    getHTML(){
        const style = this.get_style();

        return `<div class="${style.classes}" id="${style.id}" style="color:${style.color}; background-color:${style.bgcolor}">
                    <i class="${style.iclasses}"></i>${style.value}
                </div>`;
    }

    discover() {
        if(this.is_shown) return;

        this.is_shown = true;

        const style = this.get_style();

        const cell = $(`#${style.id}`);

        if(style.value) cell.text(style.value);
        cell.attr('class', style.classes);
        cell.css('background-color', style.bgcolor);
        cell.css('color', style.color);
        $(`#${style.id} i`).attr('class', style.iclasses);
        $(`#${style.id}`).css('cursor', 'default');
    }


    set_flag() {
        if(this.is_shown) return;
        this.flag = (this.flag + 1) % 3;
        flags = (this.flag == FLAG) ? flags+1 : (this.flag == QUESTION) ? flags-1 : flags; 
        $('#mines_flag').text(flags);
        const style = this.get_style();
        const cell = $(`#${style.id}`);
        if(style.value) cell.text(style.value);
        cell.attr('class', style.classes);
        cell.css('background-color', style.bgcolor);
        cell.css('color', style.color);
        $(`#${style.id} i`).attr('class', style.iclasses);
    };

};

class Buscaminas {
    constructor(row_num, col_num, mines_num) {
        this.row_num = row_num;
        this.col_num = col_num;
        this.mines_num = mines_num;
        this.restart();
    }

    restart() {
        this.matrix = [];
        for(let k = 0; k < this.col_num; k++) {
            this.matrix.push([]);
            for(let j = 0; j < this.row_num; j++) {
                this.matrix[k][j] = new Cell(k, j, 0, NONE, false);
            }
        }

        let count_mines = 0;
        while(this.mines_num !== count_mines) {
            const x = Math.floor(Math.random() * this.col_num); 
            const y = Math.floor(Math.random() * this.row_num); 

            if(!this.matrix[x][y].is_bomb) {
                this.matrix[x][y].value = 9;

                if (x > 0 && y > 0 && !this.matrix[x - 1][y - 1].is_bomb) 
                    this.matrix[x - 1][y - 1].value += 1;

                if (y > 0 && !this.matrix[x][y - 1].is_bomb) 
                    this.matrix[x][y - 1].value += 1;

                if (x < this.col_num - 1 && y > 0 && !this.matrix[x + 1][y - 1].is_bomb) 
                    this.matrix[x + 1][y - 1].value += 1;

                if (x > 0 && !this.matrix[x - 1][y].is_bomb) 
                    this.matrix[x - 1][y].value += 1;

                if (x < this.col_num - 1 && !this.matrix[x + 1][y].is_bomb) 
                    this.matrix[x + 1][y].value += 1;

                if (x > 0 && y < this.row_num - 1 && !this.matrix[x - 1][y + 1].is_bomb) 
                    this.matrix[x - 1][y + 1].value += 1;

                if (y < this.row_num - 1 && !this.matrix[x][y + 1].is_bomb) 
                    this.matrix[x][y + 1].value += 1;

                if (x < this.col_num - 1 && y < this.row_num - 1 && !this.matrix[x + 1][y + 1].is_bomb) 
                    this.matrix[x + 1][y + 1].value += 1;

                count_mines++;
            }
        }
    }

    create_board_ui(id) {
        $(id).html('');
        for (let h = 0; h < this.row_num; h++) {
            const row = $("<div>", { class: "btn-toolbar", role: "toolbar" });
            const row_container = $("<div>", { class: "btn-group", role: "group" });
            for (let w = 0; w < this.col_num; w++) {
                row_container.append(this.matrix[w][h].getHTML());
            }
            row.append(row_container);
            $(id).append(row);
        }

        $('.cell').css('cursor', 'pointer');

        const _this = this;

        $('.cell').contextmenu(function(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const id = $(this).attr('id');
            const coordinates = id.split('_');
            _this.set_flag(parseInt(coordinates[0]),parseInt(coordinates[1]));
            
        });

        $('.cell').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const id = $(this).attr('id');
            const coordinates = id.split('_');
            _this.discover(parseInt(coordinates[0]),parseInt(coordinates[1]));
        });
    }

    discover(x,y) {
        if(x < 0 || x >= this.col_num) return;
        if(y < 0 || y >= this.row_num) return;
        if(this.matrix[x][y].is_shown) return;
        if(this.matrix[x][y].flag !== NONE) return;
        this.matrix[x][y].discover();
        switch(this.matrix[x][y].value) {
            case 9: 
                this.lost();
                break;
            case 0: 
                this.discover(x - 1 , y - 1); this.discover(x, y - 1); this.discover(x + 1, y - 1);
                this.discover(x - 1, y); this.discover(x + 1, y);
                this.discover(x - 1, y + 1); this.discover(x, y + 1); this.discover(x + 1, y + 1);
                break;
        }        
    }

    is_victory(){
        let found_mines_count = 0;
        let num_flags = 0;
        for (let w = 0; w < this.col_num; w++) {
            for (let h = 0; h < this.row_num; h++) {
                if (this.matrix[w][h].flag === FLAG) {
                    num_flags++;
                    if (this.matrix[w][h].value === 9)
                        found_mines_count++;
                }
            }
        }
    
        return found_mines_count === this.mines_num && num_flags === found_mines_count;
    };

    is_started() {
        for (let w = 0; w < this.col_num; w++) {
            for (let h = 0; h < this.row_num; h++) {
                if (this.matrix[w][h].is_shown) {
                   return true; 
                }
            }
        }
        return false;
    }

    set_flag(x,y) {
        this.matrix[x][y].set_flag();
        if(this.is_victory()){
            $('.cell').off();
            for (let w = 0; w < this.col_num; w++) {
                for (let h = 0; h < this.row_num; h++) {
                    if (this.matrix[w][h].flag == FLAG) {
                        $(`#${w}_${h}`).css('background-color', 'green');
                    }
                }
            }
            end_game();
        }
    }

    lost(){
        $('.cell').off();
        for (let w = 0; w < this.col_num; w++) {
            for (let h = 0; h < this.row_num; h++) {
                if (this.matrix[w][h].is_bomb) {
                    this.matrix[w][h].discover();
                }
            }
        }

        end_game();
    }
};

/**
 * MAIN
 */
function new_game() {
    time = 0;
    flags = 0;
    $('#time').text('000');
    $('#mines_flag').text('0');
    if(timer) clearInterval(timer);
    buscaminas = new Buscaminas(8, 8, 8); 
    buscaminas.create_board_ui("#board_container");
    timer = setInterval(() => {
        if(buscaminas.is_started()){
            time++;
            const zeroFilled = ('000' + time).substr(-3);
            $('#time').text(zeroFilled);
        }        
    }, 1000);
}

function end_game(){
    if(timer) clearInterval(timer);
}

$(document).ready(function () {
    new_game();
});
