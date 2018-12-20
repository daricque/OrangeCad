/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../raphael.js" />
/// <reference path="diagrama.js" />

var Estado = function (diagrama, posX, posY, sizeX, sizeY, radius) {
    /// <summary>
    ///     Pode ser representado por um dos casos abaixo:
    ///     &#10;1: Círculo.
    ///     &#10;    1.1 - Estado(diagrama, posX, posY, radius)
    ///     &#10;2: Elipse.
    ///     &#10;    2.1 - Estado(diagrama, posX, posY, radiusX, radiusY) 
    ///     &#10;3: Retângulo (radius é a curvatura das bordas).
    ///     &#10;    3.1 - Estado(diagrama, posX, posY, sizeX, sizeY, radius)
    /// </summary>
    /// <param name="diagrama" type="Diagrama">
    ///     O diagrama em que o estado estará contido
    /// </param>
    /// <param name="posX" type="inteiro">
    ///     Posição horizontal do estado no diagrama.
    /// </param>
    /// <param name="posY" type="inteiro">
    ///     Posição vertical do estado no diagrama.
    /// </param>
    /// <returns type="Estado" />
    var self = this;
    this.tipo = "estado";

    //Variáveis
    this.posX = posX;
    this.posY = posY;
    this.selecionado = false;
    this.associacao = null; //Objeto jQuery do tr da associação desse estado.
    this.mapaTransicao = null; //Objeto jQuery do tr de transições desse estado.
    this.tabelaTransicao = null; //Objeto jQuery do tr de transições desse estado.

    this.diagrama = diagrama;

    this.id = diagrama.EstadoId();
    this.saida = [].AlterarTamanho(diagrama.saidaMoore, '0');
    this.codificacao = null;



    //this.text = this.id + '\n' + this.saida;

    this.type;
    this.graph;
    this.caminhos = new Array();
    //this.reta = null;

    //Cores de seleção.
    this.cores = {
        normal: '#000',
        selecionado: '#44C',
        caminho: '#F25',
        simulacao: '#3d35b8'
    };

    this.Redesenha = function (dx, dy) {
        self.gTexto.attr({ 'font-size': self.diagrama.Size(10) });
        self.graph.attr({ r: self.diagrama.Size(), 'stroke-width': self.diagrama.Size(2) });
        self.Move(dx, dy);
        for (var i = 0; i < self.caminhos.length; i++) {
            self.caminhos[i].Redesenha();
        }
    }

    function Refresh() {
        self.gTexto.attr({ text: self.Texto() });
    }

    this.Texto = function (id, saida) {
        if (!id) return self.id + '\n' + self.saida.join('');

        if ((id || id == 0) && !saida) {
            self.id = id;
        }

        if ((id || id == 0) && (saida || saida == 0)) {
            self.id = id;
            self.saida = saida;
        }

        Refresh();

        return self;
    }

    this.Saida = function (posicao, valor) {
        if (!posicao && posicao != 0) return self.saida;
        if ((valor || valor == 0) && (posicao || posicao == 0)) {
            try {
                self.saida[parseInt(posicao)] = valor;
            } catch (e) {
                //if (console && console.log)
                ////console.log(e);
            }
        } else if (posicao || posicao == 0) {
            self.saida.AlterarTamanho(posicao, '0');
        }
        Refresh();

        return self;
    }

    //Iniciação
    this.gTexto = this.diagrama.paper.text(posX, posY, this.Texto());
    this.gTexto.attr({ 'font-size': this.diagrama.Size(10) + 'px' });
    if (arguments.length == 4) {
        this.type = 'circle';
        this.graph = this.diagrama.paper[this.type](posX, posY, sizeX);
        //////console.log('X.'+posX+' Y.'+posY+' S.'+ sizeX);
        this.radius = sizeX;
    } else if (arguments.length == 5) {
        this.type = 'ellipse';
        this.graph = this.diagrama.paper[this.type](posX, posY, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    } else if (arguments.length == 6) {
        this.type = 'rect';
        this.graph = this.diagrama.paper[this.type](posX - sizeX / 2, posY - sizeY / 2, sizeX, sizeY, radius);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.radius = sizeX;
    }

    this.graph.estado = this;

    var color = Raphael.getColor();
    this.graph.attr({ fill: '#00f', stroke: '#000', "fill-opacity": 0, "stroke-width": self.diagrama.Size(2) });

    //Métodos
    this.remove = function () {
        self.diagrama.DeselecionarEstado(self); //Para o caso dele estar selecionado.
        self.graph.remove();
        self.gTexto.remove();
        self.associacao.remove();
        self.mapaTransicao.remove();
        self.tabelaTransicao.remove();
        //Artimanha para criar um referencia diferente de uma lista com os mesmos caminhos da outra
        //usei isso para poder passar todos caminha para função de deletar caminho
        var a = self.caminhos.slice(0, self.caminhos.length);
        self.RemoverCaminho(a);
        delete self;
    };

    this.Selecionar = function (cor) {
        if (!cor)
            if (self.diagrama.Comando() == 'selecionar')
                cor = self.cores.selecionado;
            else
                cor = self.cores.caminho;
        self.graph.attr('stroke', cor);
        self.selecionado = true;
    }

    this.Simula = function () {
        var cor = self.cores.simulacao;
        self.graph.animate({ 'stroke': cor, 'fill-opacity': 0.5 }, 1000, 'bounce');
    }

    this.Desimula = function () {
        var cor = self.cores.normal;
        self.graph.animate({ 'stroke': cor, 'fill-opacity': 0 }, 1000, 'bounce');
    }

    this.Deselecionar = function () {
        self.graph.attr('stroke', self.cores.normal);
        self.selecionado = false;
        return self;
    }

    this.RemoverCaminho = function (caminho) {
        if ($.isArray(caminho))
            $.each(caminho, function (key, val) {
                self.RemoverCaminho(val);
            });
        else $.each(self.caminhos, function (key, val) {
            if (val == caminho) {
                self.caminhos.removeByIndex(key);
                caminho.remove();
            }
        });

        return self;
    }

    this.ExisteCaminhoDe = function (de) {
        var r = false;

        $.each(self.caminhos, function (key, val) {
            if (val.de == de && val.para == self)
                r = true;
        });

        return r;
    }

    this.Reta = function (x, y) {
        if (self.reta == null) {
            Estado.prototype.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y); // self.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y);
        } else {
            var path = ["M" + self.posX, self.posY, "L" + x, y].join(',');
            self.reta.attr({ path: path });
        }
        return self.reta;
    }

    this.ContidoEm = function (xStart, yStart, xEnd, yEnd) {
        return Contido(self.posX, self.posY, xStart, yStart, xEnd, yEnd);
    }

    this.EstadoInicial = function () {
        self.diagrama.EstadoInicial(self);
    }

    this.Codificacao = function () {
        self.diagrama.Codificacao(self);
    }

    this.EstadoId = function (id) {
        self.diagrama.EstadoId(id, self);
    }

    this.ProximoEstado = function (entrada, codificacao) {
        var possibilidades = 0;
        var resposta = '-';
        var caminho, e, contador;
        for (var i = 0; i < self.caminhos.length; i++) {
            caminho = self.caminhos[i];
            for (var j = 0; j < caminho.Entrada().length; j++) {
                if (caminho.de == self) {
                    e = caminho.Entrada()[j];
                    if (caminho.Entrada()[j].join('') == entrada) {
                        if (possibilidades) return 'Indefinido';
                        else {
                            possibilidades++;
                            if (codificacao) resposta = caminho.para.codificacao;
                            else resposta = caminho.para.id;
                        }
                    } else {
                        contador = 0;
                        for (var k = 0; k < e.length; k++) {
                            contador += e[k] == entrada[k] || e[k] == 'X' ? 1 : 0;
                        }
                        if (contador == e.length) {
                            if (possibilidades) return 'Indefinido';
                            else {
                                possibilidades++;
                                if (codificacao) resposta = caminho.para.codificacao;
                                else resposta = caminho.para.id;
                            }
                        }
                    }
                }
            }
        }

        return resposta;
    }

    this.Move = function (dx, dy) {
        var diagrama = self.diagrama;
        var graph = self.graph;

        graph.ox = graph.type == "rect" ? graph.attr("x") : graph.attr("cx");
        graph.oy = graph.type == "rect" ? graph.attr("y") : graph.attr("cy");

        var att = graph.type == "rect" ? { x: graph.ox + dx, y: graph.oy + dy} : { cx: graph.ox + dx, cy: graph.oy + dy };
        var attTexto = { x: graph.ox + dx, y: graph.oy + dy };

        graph.attr(att);
        self.gTexto.attr(attTexto);
        if (self == diagrama.EstadoInicial()) diagrama.BolaInicial(att);

        //////console.log(dx + ":" + dy);
        for (var i = self.caminhos.length; i--; ) {
            var c;
            if (self.caminhos[i].de == self) {
                c = self.caminhos[i].controls[0];

                c.update((dx - (c.dx || 0)), (dy - (c.dy || 0)), true);
                c.dx = dx;
                c.dy = dy;
            }
            if (self.caminhos[i].para == self) {
                c = self.caminhos[i].controls[2];

                c.update((dx - (c.dx || 0)), (dy - (c.dy || 0)), true);
                c.dx = dx;
                c.dy = dy;
            }
        }

        self.posX = graph.attr('cx');
        self.posY = graph.attr('cy');

        for (var i = self.caminhos.length; i--; ) {
            var c;
            if (self.caminhos[i].de == self) {
                c = self.caminhos[i].controls[0];
                c.dx = c.dy = 0;
            }
            if (self.caminhos[i].para == self) {
                c = self.caminhos[i].controls[2];
                c.dx = c.dy = 0;
            }
        }
        diagrama.paper.safari();
    }
}
Estado["toString"] = function () {
    return "Classe de Modelo para os Estados\nCriado por Gabriela Silva Ribeiro.";
}