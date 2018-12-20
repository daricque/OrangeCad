Raphael.fn.caminho = function (de, para) {
    //Caso 'de' seja um caminho, redesenha o caminho seguindo os padrões (geralmente sobre o evento de click duplo)
    //Caso 'de' seja um gráfico, 'para' não pode ser nulo e é criado um caminho entre 'de' e 'para'
    //Em ambos os casos, o caminho é retornado (criado ou modificado)
    var caminho = null;
    if (de.tipo == "caminho") {
        caminho = de;
        para = de.para.graph;
        de = de.de.graph;
    }

    var estado = de.estado;
    var diagrama = estado.diagrama;
    var discattr = { fill: "#000", stroke: "none" };
    var textattr = { fill: "#000", stroke: "none", 'font-size': diagrama.Size(10) + 'px' };
    //var discattr = { fill: Raphael.getColor(), stroke: "none" };
    var cores = {
        normal: '#338',
        selecionado: '#444',
        caminho: '#52F'
    };
    var entradas;
    var x, y, ax, ay, bx, by, axE, ayE, axD, ayD, zx, zy, color = cores.normal;

    //Definições da reta
    var anguloDefasado = 30; // angulo relativo dos ponto de saída e chega entre os estados
    var maxDist = 150; //o valor acima dessa distância só conta 5%, por exemplo: 220 = 125

    var bb1 = de.getBBox(),
            bb2 = para.getBBox();

    var h1 = bb1.height,
            w1 = bb1.width,
            h2 = bb2.height,
            w2 = bb2.width;

    var cx = bb1.x + w1 / 2,
            cy = bb1.y + h1 / 2,
            czx = bb2.x + w2 / 2,
            czy = bb2.y + h2 / 2;

    //    var retaDePara = this.retaInvisivel(cx, cy, czx, czy);
    //    var p1 = retaDePara.getPointAtLength(de.estado.diagrama.size);
    //    var p2 = retaDePara.getPointAtLength(retaDePara.getTotalLength() - de.estado.diagrama.size);

    //var retaDePara = this.retaInvisivel(cx, cy, czx, czy);
    if (de != para) {
        var retaDePara = estado.Reta(czx, czy);
        var anguloSaida = AnguloEntrePontos(cx, cy, czx, czy);
        var anguloChegada = anguloSaida >= 0 ? anguloSaida + 180 : anguloSaida - 180;
        var distancia = DistanciaEntrePontos(cx, cy, czx, czy);
        distancia = distancia > maxDist ? distancia / 100 * 5 + maxDist : distancia;
        var distanciaTexto = distancia / 3 < 30 ? distancia / 3 + 15 : distancia / 3 - 15;

        ////console.log("anguloSaida=" + anguloSaida + ":" + "anguloChegada=" + anguloChegada + ":" + "distancia=" + distancia + ":" + "distanciaTexto=" + distanciaTexto);

        var raio = diagrama.Size();
        //var p1 = { x: raio * Math.sin((anguloSaida + 30) * Math.PI / 180) + cx, y: raio * Math.cos((anguloSaida + 30) * Math.PI / 180) + cy };
        //var p2 = { x: raio * Math.sin((anguloChegada - 30) * Math.PI / 180) + czx, y: raio * Math.cos((anguloChegada - 30) * Math.PI / 180) + czy };
        var p1 = CalculaPonto(cx, cy, anguloSaida + anguloDefasado, raio);
        var p2 = CalculaPonto(czx, czy, anguloChegada - anguloDefasado, raio + diagrama.Size(1));

        var ponto_meio_reta = retaDePara.getPointAtLength(retaDePara.getTotalLength() / 2);


        var curva_p1 = CalculaPonto(ponto_meio_reta.x, ponto_meio_reta.y, anguloSaida + 90, distancia / 3);
        var texto_p1 = CalculaPonto(ponto_meio_reta.x, ponto_meio_reta.y, anguloSaida + 90, distancia / 4 - diagrama.Size(20));
    } else {
        var anguloBola = 315;
        curva_p1 = CalculaPonto(cx, cy, anguloBola, diagrama.Size(75));
        p1 = CalculaPonto(cx, cy, anguloBola + anguloDefasado, diagrama.Size());
        p2 = CalculaPonto(cx, cy, anguloBola - anguloDefasado, diagrama.Size());
        texto_p1 = CalculaPonto(cx, cy, anguloBola, diagrama.Size(60));
        retaDePara = estado.Reta(curva_p1.x, curva_p1.y); //.show();

    }
    //var curca_p1 = { x: distancia * Math.sin((anguloSaida + 90) * Math.PI / 180) + cx, y: distancia * Math.cos((anguloSaida + 90) * Math.PI / 180) + cy };
    //var curva_p2 = { x: distancia * Math.sin((anguloChegada - 30) * Math.PI / 180) + czx, y: distancia * Math.cos((anguloChegada - 30) * Math.PI / 180) + czy };

    x = p1.x;
    y = p1.y;

    zx = p2.x;
    zy = p2.y;

    //    ax = x;
    //    ay = y + h1;

    //    bx = zx + w2;
    //    by = zy;

    ax = curva_p1.x;
    ay = curva_p1.y;

    axE = ax + (x - ax) / 2.5;
    ayE = ay + (y - ay) / 2.5;

    axD = ax + (zx - ax) / 2.5;
    ayD = ay + (zy - ay) / 2.5;

    bx = texto_p1.x;
    by = texto_p1.y;

    //COMO CALCULAR O ANGULO DE UM PONTO EM RELACAO A OUTRO
    // ANGULO_EM_GRAUS = Math.asin((x - e.posX) / 25)*180/Math.PI
    //COMO CALCULAR UM PONTO EM RELACAO A OUTRO E UMA DISTANCIA E UM ANGULO
    //ang = 15; x = 25 * Math.sin(ang * Math.PI / 180) + e.posX; y = 25 * Math.cos(ang * Math.PI / 180) + e.posY; p.circle(x, y, 5);

    //retaDePara = this.retaInvisivel(de.estado.posX, de.estado.posY, para.estado.posX, para.estado.posY);


    //var m = [x, y, ax, ay, bx, by, zx, zy, color].join(' ');
    //////console.log(m);

    var anguloSeta = AnguloEntrePontos(zx, zy, ax, ay);
    var pontoBase = CalculaPonto(zx, zy, anguloSeta, diagrama.Size(14));
    var seta = Triangulo(pontoBase.x, pontoBase.y, zx, zy);
    var textoInicial = diagrama.saidaMealy ? [].AlterarTamanho(diagrama.entradas, 'X').join('') + '\\' + [].AlterarTamanho(diagrama.saidaMealy, '0').join('') : [].AlterarTamanho(diagrama.entradas, 'X').join('');
    if (caminho == null) {
        //var path = [["M", x, y], ["C", ax, ay, ax, ay, pontoBase.x, pontoBase.y], ["M", pontoBase.x, pontoBase.y], seta],
        var path = [["M", x, y], ["C", axE, ayE, axD, ayD, pontoBase.x, pontoBase.y], ["M", pontoBase.x, pontoBase.y], seta],
        //path2 = [["M", x, y], ["L", ax, ay], ["M", bx, by], ["L", zx, zy]],
        //path2 = [["M", x, y], ["L", ax, ay], ["M", ax, ax], ["L", zx, zy]],
                        texto = this.text(texto_p1.x, texto_p1.y, textoInicial).attr(textattr),
                        curve = this.path(path).attr({ stroke: color || Raphael.getColor(), "stroke-width": diagrama.Size(2), "stroke-linecap": "round" }),
                        controls = this.set(
        //this.path(path2).attr({ stroke: "#ccc", "stroke-dasharray": ". " }),
                            this.circle(x, y, diagrama.Size(5)).attr(discattr),
                            this.circle(ax, ay, diagrama.Size(5)).attr(discattr),
        //this.circle(bx, by, 5).attr(discattr),
                            this.circle(zx, zy, diagrama.Size(5)).attr(discattr)
                        );
        //var pontoBase = curve.getPointAtLength(curve.getTotalLength() - diagrama.Size(14));
        //var pontoFinal = curve.getPointAtLength(curve.getTotalLength() - diagrama.Size(2));
        //var seta = this.arrow(pontoBase.x+100, pontoBase.y+100, pontoFinal.x+100, pontoFinal.y+100, 2, color, color);
        $(texto[0]).css('cursor', 'default');
        controls[0].estado = de.estado;
        controls[0].update = function (x, y, fromEstado) {
            var X = this.attr("cx") + x,
                                    Y = this.attr("cy") + y;

            this.attr({ cx: X, cy: Y });
            path[0][1] = X;
            path[0][2] = Y;
            //path2[0][1] = X;
            //path2[0][2] = Y;
            controls[1].update(x / 2, y / 2, fromEstado);
        };
        //controls[1].de = de.estado;
        //controls[1].para = para.estado;
        controls[1].update = function (x, y, fromEstado) {
            var X = this.attr("cx") + x,
                                    Y = this.attr("cy") + y;

            var axE = X + (controls[0].attr('cx') - X) / 2.5;
            var ayE = Y + (controls[0].attr('cy') - Y) / 2.5;

            var axD = X + (controls[2].attr('cx') - X) / 2.5;
            var ayD = Y + (controls[2].attr('cy') - Y) / 2.5;

            this.attr({ cx: X, cy: Y });

            if (fromEstado) texto.attr({ x: texto.attr('x') + x, y: texto.attr('y') + y });

            var anguloSeta = AnguloEntrePontos(zx, zy, X, Y);
            var pontoBase = CalculaPonto(zx, zy, anguloSeta, diagrama.Size(14));
            var seta = Triangulo(pontoBase.x, pontoBase.y, zx, zy);
            path[3] = seta;

            path[1][1] = axE;
            path[1][2] = ayE;
            //path2[1][1] = X;
            //path2[1][2] = Y;
            path[1][3] = axD;
            path[1][4] = ayD;
            path[1][5] = pontoBase.x;
            path[1][6] = pontoBase.y;
            path[2][1] = pontoBase.x;
            path[2][2] = pontoBase.y;
            curve.attr({ path: path });

            //var pontoBase = curve.getPointAtLength(curve.getTotalLength() - diagrama.Size(14));
            //var pontoFinal = curve.getPointAtLength(curve.getTotalLength() - diagrama.Size(2));
            //seta.attr({ path: Triangulo(pontoBase.x, pontoBase.y, pontoFinal.x, pontoFinal.y) });
            //controls[0].attr({ path: path2 });
        };
        /*controls[2].update = function (x, y) {
        var X = this.attr("cx") + x,
        Y = this.attr("cy") + y;
        this.attr({ cx: X, cy: Y });
        path[1][3] = X;
        path[1][4] = Y;
        path2[2][1] = X;
        path2[2][2] = Y;
        curve.attr({ path: path });
        //controls[0].attr({ path: path2 });
        };*/
        controls[2].estado = para.estado;
        controls[2].update = function (x, y, fromEstado) {
            var X = this.attr("cx") + x,
                                    Y = this.attr("cy") + y;
            this.attr({ cx: X, cy: Y });
            zx = X;
            zy = Y;
            //path[1][5] = X;
            //path[1][6] = Y;
            //        //path2[3][1] = X;
            //        //path2[3][2] = Y;
            controls[1].update(x / 2, y / 2, fromEstado);
        };

        //    retaDePara.attr({ rotation: "30 " + cx + " " + cy });
        //    p12 = retaDePara.getPointAtLength(de.estado.diagrama.size);
        //    p22 = retaDePara.getPointAtLength(retaDePara.getTotalLength() - de.estado.diagrama.size);

        //    controls[1].attr({ rotation: "30 " + cx + " " + cy });
        //    clone = controls[1].clone();
        //    controls[1].attr({ rotation: "0 " + cx + " " + cy });
        //controls[1].stop();
        //controls[1].update(controls[0].node.cx.baseVal.value - controls[1].attr('cx'), controls[1].node.cy.baseVal.value - controls[1].attr('cy'));
        //controls[1].update(controls[0].node.cx.baseVal.value - controls[1].attr('cx'), controls[1].node.cy.baseVal.value - controls[1].attr('cy'));

        controls.hide();

        var caminhoObjeto = {
            entradas: [[].AlterarTamanho(diagrama.entradas, 'X')],
            saidas: [[].AlterarTamanho(diagrama.saidaMealy, '0')],
            qtdEntrada: 1,
            texto: texto,
            selecionado: false,
            cores: cores,
            controls: controls,
            curve: curve,
            de: de.estado,
            para: para.estado,
            tipo: "caminho",
            paper: this,
            //seta: seta,
            Selecionar: function () {
                this.selecionado = true;
                this.controls.show();
                this.controls.toFront();
                this.curve.attr({ 'stroke-width': diagrama.Size(5) });
                //this.texto.attr({ 'font-weight': 'bolder', 'font-size': '12px' });
            },
            Deselecionar: function () {
                this.selecionado = false;
                this.controls.hide();
                this.curve.attr({ 'stroke-width': diagrama.Size(2) });
                console.log(diagrama.Size(2));
                //this.texto.attr({ 'font-weight': 'normal', 'font-size': '10px' });
            },
            SelecionarCurva: function () {
                this.selecionado = true;
                this.curve.attr({ 'stroke-width': diagrama.Size(5) });
            },
            ContidoEm: function (xStart, yStart, xEnd, yEnd) {
                return Contido(this.controls[0].attr('cx'), this.controls[0].attr('cy'), xStart, yStart, xEnd, yEnd)
                       &&
                       Contido(this.controls[2].attr('cx'), this.controls[2].attr('cy'), xStart, yStart, xEnd, yEnd);
            },
            Texto: function (entradas, saidas) {
                if (!entradas) {
                    var s = '';
                    if (this.saidas[0] && this.saidas[0].length)
                        for (var i = 0; i < this.entradas.length; i++) {
                            if (i) s += '\n';
                            s += this.entradas[i].join('') + '\\' + this.saidas[i].join('');
                        }
                    else return this.entradas.join('\n').replace(/,/g, '');
                    return s;
                }

                if ((entradas || entradas == 0) && !saidas) {
                    this.entradas = entradas;
                }

                if ((entradas || entradas == 0) && (saidas || saidas == 0)) {
                    this.entradas = entradas;
                    this.saidas = saidas;
                }

                return this;
            },
            Entrada: function (linha, posicao, valor) {
                //                if (!linha && linha != 0) return this.entradas; //Entrada() retorna o matriz de saídas.
                //                if ((valor || valor == 0) && (posicao || posicao == 0)) { //Entrada(linha, posicao, valor)
                //                    try {
                //                        this.entradas[linha][parseInt(posicao)] = valor;
                //                    } catch (e) {
                //                        if (console && console.log)
                //                            ////console.log(e);
                //                    }
                //                } else if ((linha || linha == 0) && (posicao || posicao == 0)) { //Entrada(linha, posicao) altera a quantidade de linhas e colunas.
                //                    this.entradas.length = linha < this.entradas.length ? linha : this.entradas.length;
                //                    while (linha--) {
                //                        this.entradas[linha] || (this.entradas[linha] = []);
                //                        this.entradas[linha].AlterarTamanho(posicao, 'X');
                //                    }
                //                } else if (linha || linha == 0) { //Entrada(linha) altera o tamanho das linhas.
                //                    var i = this.entradas.length;
                //                    while (i--) {
                //                        this.entradas[i].AlterarTamanho(linha, 'X');
                //                    }
                //                }

                if (posicao < 0) { //o objetivo aqui é remover uma linha
                    this.entradas.remove(linha);
                } else {
                    var r = Entradas_e_Saidas(this.entradas, 'X', linha, posicao, valor);
                    if (r) return r;
                }
                if (this.entradas.length != this.saidas.length) return this;
                else return this.Refresh();
            },
            Saida: function (linha, posicao, valor) {
                //                if (!linha && linha != 0) return this.saidas; //Saida() retorna o matriz de saídas.
                //                if ((valor || valor == 0) && (posicao || posicao == 0)) { //Saida(linha, posicao, valor)
                //                    try {
                //                        this.saidas[linha][parseInt(posicao)] = valor;
                //                    } catch (e) {
                //                        if (console && console.log)
                //                            ////console.log(e);
                //                    }
                //                } else if (linha || linha == 0) { //Saida(linha) altera o tamanho das linhas.
                //                    var i = this.saidas.length;
                //                    while (i--) {
                //                        this.saidas[i].AlterarTamanho(linha, '0');
                //                    }
                //                }
                if (posicao < 0) { //o objetivo aqui é remover uma linha
                    this.saidas.remove(linha);

                } else {
                    var r = Entradas_e_Saidas(this.saidas, '0', linha, posicao, valor);
                    if (r) return r;
                }

                if (this.entradas.length != this.saidas.length) return this;
                else return this.Refresh();
            },
            Refresh: function () {
                this.texto.attr({ text: this.Texto() });
                return this;
            },
            VerificaEntrada: function (linha, coluna, valor) {

            },
            Simula: function () {

            },
            Desimula: function () {
            },
            Redesenha: function () {
                var anguloDe = AnguloEntrePontos(this.de.posX, this.de.posY, controls[0].attr('cx'), controls[0].attr('cy'));
                var anguloPara = AnguloEntrePontos(this.para.posX, this.para.posY, controls[2].attr('cx'), controls[2].attr('cy'));

                var pontoDe = CalculaPonto(this.de.posX, this.de.posY, anguloDe, diagrama.Size());
                var pontoPara = CalculaPonto(this.para.posX, this.para.posY, anguloPara, diagrama.Size());

                var anguloCurva = AnguloEntrePontos(this.de.posX, this.de.posY, controls[1].attr('cx'), controls[1].attr('cy'));
                var distanciaCurva = DistanciaEntrePontos(this.de.posX, this.de.posY, controls[1].attr('cx'), controls[1].attr('cy'));
                var pontoCurva = CalculaPonto(this.de.posX, this.de.posY, anguloCurva, diagrama.Size(distanciaCurva)); ;

                pontoDe.x = pontoDe.x - controls[0].attr('cx');
                pontoDe.y = pontoDe.y - controls[0].attr('cy');
                pontoPara.x = pontoPara.x - controls[2].attr('cx');
                pontoPara.y = pontoPara.y - controls[2].attr('cy');

                controls[0].update(pontoDe.x, pontoDe.y);
                controls[2].update(pontoPara.x, pontoPara.y);

                texto.attr({ 'font-size': diagrama.Size(10) });
            },
            remove: function () {
                this.de.diagrama.DeselecionarCaminho(this);
                this.controls.remove();
                this.curve.remove();
                this.de.RemoverCaminho(this);
                this.para.RemoverCaminho(this);
                this.texto.remove();
                //this.seta.remove();
            }
        };

        return caminhoObjeto;
    } else {
        caminho.controls[0].update(x - caminho.controls[0].attr('cx'), y - caminho.controls[0].attr('cy'));
        caminho.controls[2].update(zx - caminho.controls[2].attr('cx'), zy - caminho.controls[2].attr('cy'));
        caminho.controls[1].update(ax - caminho.controls[1].attr('cx'), ay - caminho.controls[1].attr('cy'));
        //caminho.texto.attr({ x: texto_p1.x, y: texto_p1.y });
        caminho.texto.attr({ x: texto_p1.x, y: texto_p1.y });
        caminho.controls[0].dx = caminho.controls[0].dy = caminho.controls[2].dx = caminho.controls[2].dy = 0;
        //caminho.curve.attr({ path: path });

        //path2 = [["M", x, y], ["L", ax, ay], ["M", bx, by], ["L", zx, zy]],
        //path2 = [["M", x, y], ["L", ax, ay], ["M", ax, ax], ["L", zx, zy]],
        //texto = this.text(texto_p1.x, texto_p1.y, 'XXX/00'),
        //curve = this.path(path).attr({ stroke: color || Raphael.getColor(), "stroke-width": 2, "stroke-linecap": "round" }),
        //        controls = this.set(
        //        //this.path(path2).attr({ stroke: "#ccc", "stroke-dasharray": ". " }),
        //                            this.circle(x, y, 5).attr(discattr),
        //                            this.circle(ax, ay, 5).attr(discattr),
        //        //this.circle(bx, by, 5).attr(discattr),
        //                            this.circle(zx, zy, 5).attr(discattr)
        //                        );
        //caminho.configs(x, y, ax, ay, bx, by, zx, zy, color);
        return caminho;
    }
}

function Entradas_e_Saidas(vetor, letra, linha, posicao, valor) {
    if (!linha && linha != 0) return vetor; //Entrada() retorna o matriz de saídas.
    if ((valor || valor == 0) && (posicao || posicao == 0)) { //Entrada(linha, posicao, valor)
        try {
            vetor[linha][parseInt(posicao)] = valor;
        } catch (e) {
            //if (console && console.log)
            ////console.log(e);
        }
    } else if ((linha || linha == 0) && (posicao || posicao == 0)) { //Entrada(linha, posicao) altera a quantidade de linhas e colunas.
        vetor.length = linha < vetor.length ? linha : vetor.length;
        while (linha--) {
            vetor[linha] || (vetor[linha] = []);
            vetor[linha].AlterarTamanho(posicao, letra);
        }
    } else if (linha || linha == 0) { //Entrada(linha) altera o tamanho das linhas.
        var i = vetor.length;
        while (i--) {
            vetor[i].AlterarTamanho(linha, letra);
        }
    }

    return false;
}

function AnguloEntrePontos(x, y, zx, zy) {
    var distancia = DistanciaEntrePontos(x, y, zx, zy);
    if (distancia == 0) return 0;
    var anguloX = Math.asin((zx - x) / distancia) * 180 / Math.PI;
    var anguloY = Math.acos((zy - y) / distancia) * 180 / Math.PI;
    var angulo;
    if (anguloX >= 0)
        angulo = anguloY;
    else
        angulo = 360 - anguloY;
    //////console.log("X:" + angulo + " Y:"+angulo1+" YOMIXIXO:"+angulo2);
    // ANGULO_EM_GRAUS = Math.asin((x - e.posX) / distancia)*180/Math.PI
    return angulo;
}

function DistanciaEntrePontos(x, y, zx, zy) {
    return Math.sqrt(Math.pow((x - zx), 2) + Math.pow((y - zy), 2));
}

function CalculaPonto(x, y, angulo, distancia) {
    var ponto = {};
    ponto.x = distancia * Math.sin(angulo * Math.PI / 180) + x;
    ponto.y = distancia * Math.cos(angulo * Math.PI / 180) + y;
    return ponto;
}

function TestaAngulos() {

    var pontoCentral = { x: 100, y: 100 };
    var pontos = [100, 200, 200, 200, 200, 100, 200, 0, 100, 0, 0, 0, 0, 100, 0, 200];
    for (var i = 0; i < 8; i++) {
        ////console.log(i);
        AnguloEntrePontos(pontoCentral.x, pontoCentral.y, pontos[2 * i], pontos[2 * i + 1]);
    }

}