/// <reference path="../Modelo/estado.js" />
/// <reference path="../raphael.js" />
/// <reference path="../Modelo/diagrama.js" />
/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../jQuery.DataLink.js" />

var move = function (dx, dy) {
    if(exibirLog4213) console.log('move');
    var estado = this.estado;
    var diagrama = estado.diagrama;

    if (diagrama.Comando() == "selecionar") {

        estado.moveu = Math.abs(dx + dy) > 5;

        moveEstado(estado, dx, dy);

    }
};

var dragger = function (estado) {
    if(exibirLog4213) console.log('dragger');
    var estado = this.estado;
    var diagrama = estado.diagrama;

    if (diagrama.Comando() == "selecionar") {

        this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
        this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");

        this.animate({ "fill-opacity": .2 }, 500);
    }
};

var up = function () {
    if(exibirLog4213) console.log('up');
    var estado = this.estado;
    var diagrama = estado.diagrama;

    if (diagrama.Comando() == "selecionar") {

        this.animate({ "fill-opacity": 0 }, 500);

        estado.posX = this.attr('cx');
        estado.posY = this.attr('cy');

        for (var i = estado.transicoes.length; i--; ) {
            var c;
            if (estado.transicoes[i].de == estado) {
                c = estado.transicoes[i].controls[0];
                c.dx = c.dy = 0;
            }
            if (estado.transicoes[i].para == estado) {
                c = estado.transicoes[i].controls[2];
                c.dx = c.dy = 0;
            }
        }
        return;
    }
    
    return false;
};

var duplo_click = function (e) {
    if(exibirLog4213) console.log('duplo_click');
    var estado = e.data;
    var diagrama = estado.diagrama;

    diagrama.timeline.Ativo(false);

    if (estado.diagrama.Comando() == "selecionar")
        for (var i = 0; i < estado.transicoes.length; i++) {
            redesenhaTransicao(estado.transicoes[i]);
        }

    diagrama.timeline.Ativo(true);
    if (estado.diagrama.Comando() == "selecionar")
        if (diagrama.timeline.UltimoSave().donde != (estado.id + '_duplo_click') && (diagrama.timeline.UltimoSave().donde != 'diagrama_duplo')) diagrama.timeline.Salvar(estado.id + '_duplo_click');
    return false;
}

var clicado = function (e) {
    if(exibirLog4213) console.log('clicado');
    var estado = e.data;
    var diagrama = estado.diagrama;
    if (!estado.moveu) {
        if (estado.diagrama.Comando() == "deletar") {
            var a = estado.transicoes.slice(0, estado.transicoes.length);

            $.each(a, function (key, val) {
                val.remove();
            });

            estado.diagrama.RemoverEstado(estado);
            diagrama.timeline.Salvar('remover_estado');
        }
        if (estado.diagrama.Comando() == "criar") {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }

        if (estado.diagrama.Comando() == "selecionar") {
            if (diagrama.selecionados.length != 0 && !e.ctrlKey && diagrama.selecionados[0] != estado)
                diagrama.DeselecionarTodos();
            if (!estado.selecionado) {
                diagrama.SelecionarEstado(estado);
                estado.Selecionar(estado.cores.selecionado);
            } else {
                diagrama.DeselecionarEstado(estado);
                estado.Deselecionar();
            }
            //estado.graph.attr('stroke', estado.cores.selecionado);
        }

        if (estado.diagrama.Comando() == "transicao") {
            if (diagrama.selecionados.length == 0 || e.ctrlKey) {
                //estado.se
                diagrama.SelecionarEstado(estado);
                estado.Selecionar(estado.cores.transicao);
                //estado.graph.attr('stroke', estado.cores.transicao);
            } else {
                CriarTransicao(estado, diagrama);
            }
        }
    } else {
        diagrama.timeline.Salvar('estado_clicado_moveu');
    }
    estado.moveu = false;
}

var mouse_soltou = function (e) {
    if(exibirLog4213) console.log('mouse_soltou');
    var estado = e.data;
}

var estado_down = function (e) {
    if(exibirLog4213) console.log('estado_down');
    var estado = e.data;
    var diagrama = estado.diagrama;
    if (diagrama.Comando() != 'arrastar') {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    }
}

function CriarTransicao(estado, diagrama) {
    if(exibirLog4213) console.log('CriarTransicao');
    var a = diagrama.selecionados.slice(0, diagrama.selecionados.length);
    var salvar = false;
    $.each(a, function (key, val) {
        if (!val.curve && !estado.ExisteTransicaoDe(val)) {
            CriarTransicaoDePara(val, estado, true);
            salvar = true;

            //            //var c = diagrama.paper.connection(val.graph, estado.graph, "#000", "#abc|1");
            //            var c = diagrama.paper.transicao(val.graph, estado.graph);

            //            //controles do transicao
            //            c.controls.drag(transicao_move, function () { }, transicao_up)
            //                          .mouseover(ballOver)
            //                          .mouseout(ballOut)
            //                          .dblclick(redesenhaTransicao, c);
            //            c.curve.mouseover(curveOver, c).mouseout(curveOut, c);
            //            c.curve.click(transicao_clicado, c);
            //            c.curve.drag(transicao_move, function () { }, transicao_up, c.controls[1], c.controls[1], c.controls[1]);
            //            c.texto.drag(move_generico, dragger_generico, up_generico);
            //            c.texto.click(transicao_clicado, c);
            //            val.transicoes.push(c);
            //            if (estado != val)
            //                estado.transicoes.push(c);
        }
        diagrama.DeselecionarEstado(val);
    });
    if(salvar) diagrama.timeline.Salvar('CriarTransicao');
}

function CriarTransicaoDePara(de, para, naoSalvar) {
    var c = de.diagrama.paper.transicao(de.graph, para.graph);

    //controles do transicao
    c.controls.drag(transicao_move, function () { }, transicao_up)
                          .mouseover(ballOver)
                          .mouseout(ballOut)
                          .dblclick(redesenhaTransicao, c);
    c.curve.mouseover(curveOver, c).mouseout(curveOut, c);
    c.curve.click(transicao_clicado, c).dblclick(redesenhaTransicao, c);
    c.curve.drag(transicao_move, function () { }, transicao_up, c.controls[1], c.controls[1], c.controls[1]);
    c.texto.drag(move_generico, dragger_generico, up_generico);
    c.texto.click(transicao_clicado, c).dblclick(redesenhaTransicao, c);
    de.transicoes.push(c);
    if (para != de)
        para.transicoes.push(c);

    if(!naoSalvar) de.diagrama.timeline.Salvar('CriarTransicaoDePara');

    return c;
}

function moveEstado(estado, dx, dy) {
    if(exibirLog4213) console.log('moveEstado');
    var diagrama = estado.diagrama;
    var graph = estado.graph;

    var att = graph.type == "rect" ? { x: graph.ox + dx, y: graph.oy + dy} : { cx: graph.ox + dx, cy: graph.oy + dy };
    var attTexto = { x: graph.ox + dx, y: graph.oy + dy };

    graph.attr(att);
    estado.gTexto.attr(attTexto);
    if (estado == diagrama.EstadoInicial()) diagrama.BolaInicial(att);

    if(exibirLog4213) console.log(dx + ":" + dy);
    for (var i = estado.transicoes.length; i--; ) {
        var c;
        if (estado.transicoes[i].de == estado) {
            c = estado.transicoes[i].controls[0];

            c.update((dx - (c.dx || 0)), (dy - (c.dy || 0)), true);
            c.dx = dx;
            c.dy = dy;
        }
        if (estado.transicoes[i].para == estado) {
            c = estado.transicoes[i].controls[2];

            c.update((dx - (c.dx || 0)), (dy - (c.dy || 0)), true);
            c.dx = dx;
            c.dy = dy;
        }
    }
    diagrama.paper.safari();
}