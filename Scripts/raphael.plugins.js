/// <reference path="raphael.js" />
/// <reference path="jquery-1.6.1-vsdoc.js" />
/// <reference path="jquery-ui-1.8.13.js" />

//Raphael.fn.connection = function (obj1, obj2, line, bg) {
//    if (obj1.line && obj1.from && obj1.to) {
//        line = obj1;
//        obj1 = line.from;
//        obj2 = line.to;
//    }
//    var bb1 = obj1.getBBox(),
//        bb2 = obj2.getBBox(),
//        p = [{ x: bb1.x + bb1.width / 2, y: bb1.y - 1 },
//        { x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1 },
//        { x: bb1.x - 1, y: bb1.y + bb1.height / 2 },
//        { x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2 },
//        { x: bb2.x + bb2.width / 2, y: bb2.y - 1 },
//        { x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1 },
//        { x: bb2.x - 1, y: bb2.y + bb2.height / 2 },
//        { x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
//        d = {}, dis = [];
//    for (var i = 0; i < 4; i++) {
//        for (var j = 4; j < 8; j++) {
//            var dx = Math.abs(p[i].x - p[j].x),
//                dy = Math.abs(p[i].y - p[j].y);
//            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
//                dis.push(dx + dy);
//                d[dis[dis.length - 1]] = [i, j];
//            }
//        }
//    }
//    if (dis.length == 0) {
//        var res = [0, 4];
//    } else {
//        res = d[Math.min.apply(Math, dis)];
//    }
//    var x1 = p[res[0]].x,
//        y1 = p[res[0]].y,
//        x4 = p[res[1]].x,
//        y4 = p[res[1]].y;
//    //    var x1 = p[0].x,
//    //        y1 = p[0].y,
//    //        x4 = p[5].x,
//    //        y4 = p[5].y;
//    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
//    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
//    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
//        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
//        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
//        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
//    //var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
//    if (res[0] == 0 || res[0] == 2) {
//        var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x1, y4, x1, y4, x4.toFixed(3), y4.toFixed(3)].join(",");
//    } else {
//        path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x1, y4, x1, y4, x4.toFixed(3), y4.toFixed(3)].join(",");
//    }
//    if(exibirLog4213) console.log(res);
//    //var triangule = ["M"+ x, y, t + x, y+v, x+v,y+v/2,x,y,"Z"].join(" ");
//    if (line && line.line) {
//        line.bg && line.bg.attr({ path: path });
//        line.line.attr({ path: path });
//    } else {
//        var color = typeof line == "string" ? line : "#000";
//        return {
//            de: null,
//            para: null,
//            bg: bg && bg.split && this.path(path).attr({ stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3 }),
//            line: this.path(path).attr({ stroke: color, fill: "none" }),
//            from: obj1,
//            to: obj2,
//            remove: function () {
//                this.line.remove();
//                this.bg.remove();
//                this.de.RemoverTransicao(this);
//                this.para.RemoverTransicao(this);
//                delete this;
//            }
//        };
//    }
//};

//var el;
//window.onload = function () {
//    var dragger = function () {
//        this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
//        this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
//        this.animate({ "fill-opacity": .2 }, 500);
//    },
//        move = function (dx, dy) {
//            var att = this.type == "rect" ? { x: this.ox + dx, y: this.oy + dy} : { cx: this.ox + dx, cy: this.oy + dy };
//            this.attr(att);
//            for (var i = connections.length; i--; ) {
//                r.connection(connections[i]);
//            }
//            r.safari();
//        },
//        up = function () {
//            this.animate({ "fill-opacity": 0 }, 500);
//        },
//        r = Raphael("holder", 1600, 800),
//        connections = [],
//        shapes = [r.ellipse(190, 100, 30, 20),
//                  r.rect(290, 80, 60, 40, 10),
//                  r.rect(290, 180, 60, 40, 2),
//                  r.ellipse(450, 100, 20, 20),
//                  r.circle(50, 50, 25)
//                ];
//    for (var i = 0, ii = shapes.length; i < ii; i++) {
//        var color = Raphael.getColor();
//        shapes[i].attr({ fill: color, stroke: '#000', "fill-opacity": 0, "stroke-width": 2, cursor: "move" });
//        shapes[i].drag(move, dragger, up);
//    }
//    connections.push(r.connection(shapes[0], shapes[1], "#fff"));
//    connections.push(r.connection(shapes[1], shapes[2], "#fff", "#0f0|5"));
//    connections.push(r.connection(shapes[1], shapes[3], "#000", "#fff"));
//    connections.push(r.connection(shapes[4], shapes[3], "#00f", "#f00"));
//};

Raphael.fn.arrow = function (xStart, yStart, xEnd, yEnd, strokeSize, strokeColor, fill) {
    if (!strokeSize) strokeSize = 2;
    if (!fill) fill = '#000';
    if (!strokeColor) strokeColor = '#000';

    var path = Triangulo(xStart, yStart, xEnd, yEnd);


    var config = { fill: fill, stroke: strokeColor, "stroke-width": strokeSize, "stroke-linecap": "round" };
    //var dist = Math.sqrt( (xStart-xEnd)
    //var path = ["M" + xStart, xStart, "L" + xStart, y + v, x + v, y + v / 2, x, y, "Z"].join(" ");

    return this.path(path).attr(config);
};

function Triangulo(xStart, yStart, xEnd, yEnd) {
    /// <summary>
    ///     Calula os pontos para formar um triângulo, onde o meio da base é em (xStart, yStart) e aponta para (xEnd, yEnd);
    ///     &#10;Triangulo(xStart, yStart, xEnd, yEnd, size).
    /// </summary>
    /// <param name="xStart" type="int">
    ///     Posição horizontal do meio da base do triângulo.
    /// </param>
    /// <param name="yStart" type="int">
    ///     Posição vertical do meio da base do triângulo.
    /// </param>
    /// <param name="xEnd" type="int">
    ///     Posição horizontal da ponta do triângulo.
    /// </param>
    /// <param name="yEnd" type="int">
    ///     Posição vertical da ponta do triângulo.
    /// </param>
    /// <returns type="Estado" />
    var angulo = AnguloEntrePontos(xStart, yStart, xEnd, yEnd);
    var distancia = DistanciaEntrePontos(xStart, yStart, xEnd, yEnd) * Math.sin(45 * Math.PI / 180);

    var pTop = CalculaPonto(xStart, yStart, angulo + 90, distancia / 2);
    var pBottom = CalculaPonto(xStart, yStart, angulo - 90, distancia / 2);

    return ["M" + pTop.x, pTop.y, "L" + xEnd, yEnd, pBottom.x, pBottom.y + "Z"];
}

Raphael.fn.retaInvisivel = function (xStart, yStart, xEnd, yEnd) {
    var pt = ["M" + xStart, yStart, "L" + xEnd, yEnd].join(",");
    return this.path(pt).hide();
};

$.fn.selectRange = function (start, end) {
    return this.each(function () {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

(function ($) {
    //plugin buttonset vertical
    $.fn.buttonsetv = function (width) {
        //$(':radio, :checkbox', this).wrap('<div style="margin: 1px"/>');
        $(this).buttonset();
        if($('label:first',this).length) {
            $('label:first', this).removeClass('ui-corner-left').addClass('ui-corner-top');
            $('label:last', this).removeClass('ui-corner-right').addClass('ui-corner-bottom');
        } else if($('span:first',this).length) {
            $(' > span:first',this).removeClass('ui-corner-left').addClass('ui-corner-top');
            $(' > span:last',this).removeClass('ui-corner-right').addClass('ui-corner-bottom');
        }
        mw = 0; // max witdh
        if(!width)
            $(' > span', this).each(function (index) {
                w = $(this).width();
                if (w > mw) mw = w;
            })
        else
            mw = width;

        $(' > span', this).each(function (index) {
            $(this).width(mw);
        })
    };

    $.fn.checkbox = function(){
        $(this).button({
            icons : {
                primary: "ui-icon-closethick"
            }
        }).click(function() {
            if($(this).is(':checked'))
                $(this).button({
                    icons : {
                        primary: "ui-icon-check"
                    }
                });
            else
                $(this).button({
                    icons : {
                        primary: "ui-icon-closethick"
                    }
                });
        });
    }

    $.fn.bit = function(temDontCare){
        if(!temDontCare){
            $(this).button({
                icons : {
                    primary: "ui-icon-circle-triangle-s"
                },
                label : '0'
            });
            $(this).click(function() {
                    $(this).attr('checked',true);
                    if($(this).button('option','label') == '0')
                        $(this).button({
                            icons : {
                                primary: "ui-icon-circle-triangle-n"
                            },
                            label : '1'
                        });
                    else if($(this).button('option','label') == '1')
                            $(this).button({
                                icons : {
                                    primary: "ui-icon-circle-triangle-s"
                                },
                                label : '0'
                            });
            });
            try { $(this).click().click().mouseout(); } catch (e) {}
            
        } else {
            $(this).button({
                icons : {
                    primary: "ui-icon-circle-minus"
                },
                label : 'X'
            });
            $(this).click(function() {
                    if($(this).button('option','label') == '0')
                        $(this).button({
                            icons : {
                                primary: "ui-icon-circle-triangle-n"
                            },
                            label : '1'
                        });
                    else if($(this).button('option','label') == '1')
                        $(this).button({
                            icons : {
                                primary: "ui-icon-circle-minus"
                            },
                            label : 'X'
                        });
                    else if($(this).button('option','label') == 'X')
                        $(this).button({
                            icons : {
                                primary: "ui-icon-circle-triangle-s"
                            },
                            label : '0'
                        });
            });

            try { $(this).click().click().click().mouseout(); } catch(e) {}
        }

        $.fn.editavel = function(diagrama, estado, funcao) {
            $(this).click([diagrama, estado, funcao], function(e) {
                if(exibirLog4213) console.log('clickei');
                var diagrama = e.data[0];
                var texto = $(this).text();
                $(this).text('')

                diagrama.editor.val(texto).appendTo(this).show().focus().texto = texto;

                diagrama.editor.texto = texto;

                diagrama.editor.unbind('blur');

                diagrama.editor.blur(e.data, function(e) {
                    if(exibirLog4213) console.log('blurei');
                    var diagrama = e.data[0];
                    var estado = e.data[1];
                    var funcao = e.data[2];
                    var texto;

                    if(diagrama[funcao](diagrama.editor.val(),estado,true)) //verifica se é possível atualizar o valor
                        texto = diagrama.editor.val();
                    else
                        texto = diagrama.editor.texto;
                    
                    $(this).parent().text(texto);

                    diagrama.editor.click(function () { return false; });
                    diagrama.editor.hide();
                });

                e.stopImmediatePropagation();
            });

            return this;
        }

        $.fn.showOnlyThis = function(tempo) {
                var tempoOut = [{ height: "hide" }, (tempo? tempo / 6 : 100), 'swing'];
                var tempoIn = [{ height: "show" }, (tempo? tempo : 600), 'easeOutExpo'];
                var efeitoSumir = 'animate';
                var efeitoAparecer = 'animate';

                $(this).siblings().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]).end()[efeitoAparecer](tempoIn[0], tempoIn[1], tempoIn[2]);

                return this;
            }

        return this;
    }
})(jQuery);

function ImprimePropriedades(obj) {
    if (window.console && window.console.log) {
        $.each(obj, function (key, val) {
            try {
                if(exibirLog4213) console.log(key + ":" + val);
            } catch (e) {
                if(exibirLog4213) console.log("Não foi possível imprimir a chave: " + key + " do tipo " + typeof (val) + " erro: " + e);
            }
        });
    } else {
        alert('Seu navegador não possui log');
    }
}

function Contido(x, y, xStart, yStart, xEnd, yEnd) {
    if (x >= xStart && x <= xEnd && y >= yStart && y <= yEnd) return true;
    if (x >= xStart && x <= xEnd && y <= yStart && y >= yEnd) return true;
    if (x <= xStart && x >= xEnd && y <= yStart && y >= yEnd) return true;
    if (x <= xStart && x >= xEnd && y >= yStart && y <= yEnd) return true;
    return false;
}

SVG = {};

SVG.makeDataURL = function (canvas) {
    // We don't bother with the IE serialization technique since it
    // doesn't support data: URLs
    var text = (new XMLSerializer()).serializeToString(canvas);
    var encodedText = encodeURIComponent(text);
    return "data:image/svg+xml," + encodedText;
};

// Create an <object> to display an SVG drawing using a data: URL
SVG.makeImgTag = function (canvas, width, height) {
    var object = document.createElement("img"); // Create HTML <img> tag
    object.style.width = '100%';                          // Set size of object
    object.style.height = '100%';
    object.src = SVG.makeDataURL(canvas);         // SVG image as data: URL
    //object.type = "image/svg+xml"                  // SVG MIME type
    return object;
}