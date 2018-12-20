var transicao_clicado = function (e) {
    var transicao = this;
    var diagrama = transicao.de.diagrama;
    if (diagrama.Comando() == "selecionar") {
        if (diagrama.selecionados.length != 0 && e.ctrlKey) {
            diagrama.DeselecionarTransicoes(false);
            if (!transicao.selecionado)
                transicao.SelecionarCurva();
            else
                transicao.Deselecionar();
        } else {
            if (diagrama.selecionados.length && diagrama.selecionados[0] != transicao)
                diagrama.DeselecionarTodos();
            if (transicao.selecionado)
                transicao.Deselecionar();
            else
                transicao.Selecionar();
        }
        if (transicao.selecionado)
            diagrama.SelecionarTransicao(transicao);
        else
            diagrama.DeselecionarTransicao(transicao);
    }

    if (diagrama.Comando() == "deletar") {
        transicao.remove();
        diagrama.timeline.Salvar('deletar_transicao');
    }

    if (diagrama.Comando() != "selecionar") {
        return false;
    }
}

function transicao_move(dx, dy) {
    if (diagramaPrincipal.Comando() == "selecionar") {
        if (this.estado) {
            //Pontos que estão no estado.
            var x = dx - (this.dx || 0) + (this.mx || this.attr('cx'));
            var y = dy - (this.dy || 0) + (this.my || this.attr('cy'));
            var reta = this.estado.Reta(x, y);
            if (reta.getTotalLength() < this.estado.diagrama.Size())
                return;
            var pal = reta.getPointAtLength(this.estado.diagrama.Size());
            var ddx = pal.x - this.attr('cx');
            var ddy = pal.y - this.attr('cy');
            //this.update(dx - (this.dx || 0), dy - (this.dy || 0));
            this.update(ddx, ddy);
            this.dx = dx;
            this.dy = dy;
            this.mx = x;
            this.my = y;
        } else {
            //Ponto de controle de curva da reta.
            this.update(dx - (this.dx || 0), dy - (this.dy || 0));
            this.dx = dx;
            this.dy = dy;
        }
    }
}

function transicao_up() {
    if (Math.abs(this.dx) + Math.abs(this.dy) > 10) diagramaPrincipal.timeline.Salvar('transicao_up');
    this.dx = this.dy = 0;
    this.mx = false;
    this.my = false;
}

function ballOver() {
    if (diagramaPrincipal.Comando() == "selecionar")
        this.animate({ scale: [1.2, 1.2] }, 200, "<>");
}

function ballOut() {
    if (diagramaPrincipal.Comando() == "selecionar")
        this.animate({ scale: [1, 1] }, 200, "<>");
}

function curveOver() {
    if (diagramaPrincipal.Comando() == "selecionar")
        if (!this.selecionado)
            this.curve.animate({ 'stroke-width': diagramaPrincipal.Size(5) }, 200, "<>");
}

function curveOut() {
    if (diagramaPrincipal.Comando() == "selecionar")
        if (!this.selecionado)
            this.curve.animate({ 'stroke-width': diagramaPrincipal.Size(2) }, 200, "<>");
}

function redesenhaTransicao(e) {
    if (e.tipo && e.tipo == "transicao") e.paper.transicao(e);
    else {
        this.paper.transicao(this);
        e.stopImmediatePropagation();
    }
    
}

var dragger_generico = function () {
    if (diagramaPrincipal.Comando() == "selecionar") {
        this.ox = this.type == "rect" || this.type == "text" ? this.attr("x") : this.attr("cx");
        this.oy = this.type == "rect" || this.type == "text" ? this.attr("y") : this.attr("cy");
        this.animate({ "fill-opacity": .2 }, 500);
    }
},
        move_generico = function (dx, dy) {
            if (diagramaPrincipal.Comando() == "selecionar") {
                var att = this.type == "rect" || this.type == "text" ? { x: this.ox + dx, y: this.oy + dy} : { cx: this.ox + dx, cy: this.oy + dy };
                this.attr(att);
                this.moveu = true;
            }
        },
        up_generico = function () {
            if (diagramaPrincipal.Comando() == "selecionar") {
                if (Math.abs((this.type == "rect" || this.type == "text" ? this.attr('x') : this.attr('cx')) - this.ox) + Math.abs((this.type == "rect" || this.type == "text" ? this.attr('y') : this.attr('cy')) - this.oy) > 10) diagramaPrincipal.timeline.Salvar('up_generico');
                this.animate({ "fill-opacity": 1 }, 500);
            }
        };