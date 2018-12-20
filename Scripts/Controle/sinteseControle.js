$(function () {
    $('input:radio', '#sinteseTab').click(diagramaPrincipal, function (e) {
        var diagrama = e.data;
        diagrama.MudarTipoDescricao($(this).val());
    });
});

var Sintese = function (diagrama, tipoDescricao) {
    if (tipoDescricao) diagrama.tipoDescricao == tipoDescricao;
    else tipoDescricao = diagrama.tipoDescricao;

    var $area = diagrama.tabelaSintese;
    var texto = '';
    var estado, transicao, entrada;

    if (diagrama.estados.length != 0) {

        var i = diagrama.estados[0].codificacao.length + diagrama.entradas;
        var o = diagrama.estados[0].codificacao.length + diagrama.saidaMoore + diagrama.saidaMealy;

        if (tipoDescricao == "EXPRESSO") {
            texto += "# =================================================\n" +
                            "#   UFES - Universidade Federal do Espirito Santo\n" +
                            "#   Descricao do circuito no formato ESPRESSO\n" +
                            "#   Arquivo gerado automaticamente por OrangeCAD Web em\n" +
                            "#   " + (new Date()).toLocaleString() + "\n" +
                            "# =================================================\n";

            texto += '.i ' + i + "\n";
            texto += '.o ' + o + "\n";

            for (var i = 0; i < diagrama.estados.length; i++) {
                estado = diagrama.estados[i];
                for (var j = 0; j < estado.transicoes.length; j++) {
                    transicao = estado.transicoes[j];
                    if (transicao.de == estado) {
                        for (var k = 0; k < transicao.entradas.length; k++) {
                            texto += estado.codificacao + transicao.Entrada()[k].join('').replace(/X/g, '-') + ' ';
                            texto += /*transicao.para.codificacao*/Excitacao(transicao.de.codificacao, transicao.para.codificacao, diagrama.flipflop).replace(/X/g, '-') + transicao.para.saida.join('') + transicao.Saida()[k].join('') + "\n";
                        }
                    }
                }
            }

            texto += '.e';

        }

        if (tipoDescricao == "VHDL") {
            texto += "# =================================================\n" +
                            "#   UFES - Universidade Federal do Espirito Santo\n" +
                            "#   Descricao do circuito no formato VHDL\n" +
                            "#   Arquivo gerado automaticamente por OrangeCAD Web em\n" +
                            "#   " + (new Date()).toLocaleString() + "\n" +
                            "# =================================================\n" +
                            "library ieee;\n" +
                            "use ieee.std_logic_1164.all;\n" +
                            "\n" +
                            "entity MACHINE is\n" +
	                        "\tport ( RST, CLOCK: in std_logic;\n";
            texto += "\t\tInputs: in std_logic_vector (" + (diagrama.entradas - 1) + " DOWNTO 0);\n";
            if (diagrama.saidaMoore) texto += "\t\tMoore: in std_logic_vector (" + (diagrama.saidaMoore - 1) + " DOWNTO 0)";
            if (diagrama.saidaMealy) texto += ";\n\t\tMealy: in std_logic_vector (" + (diagrama.saidaMealy - 1) + " DOWNTO 0)\n";
            else texto += "\n";
            texto += "\t);\n";
            texto += "end;\n";
            texto += "architecture BEHAVIOR of MACHINE is\n";
            texto += "\ttype state_type is (" + NomeEstados(diagrama).join() + ");\n";
            texto += "\tsignal CURRENT_STATE, NEXT_STATE: state_type;\n"
            texto += "begin\n";
            texto += "\tcombin: process (CURRENT_STATE, Inputs)\n"
            texto += "\tbegin\n";
            texto += "\tcase CURRENT_STATE is\n";
            for (var i = 0; i < diagrama.estados.length; i++) {
                estado = diagrama.estados[i];
                texto += "\t\twhen " + estado.id + " =>\n";
                if (diagrama.saidaMoore) texto += "\t\t\tMoore <= \"" + estado.saida.join('') + "\";\n";
                for (var l = 0; l < estado.transicoes.length; l++) {
                    transicao = estado.transicoes[l];
                    if (transicao.de == estado) {
                        var ifEntrada = '';
                        var hasIf = false;
                        for (var j = 0; j < transicao.entradas.length; j++) {
                            entrada = transicao.entradas[j];
                            for (var k = 0; k < entrada.length; k++) {
                                if (entrada[k] == 'X') continue;
                                if (!hasIf) texto += "\t\t\tIF ";
                                else texto += ' and ';
                                texto += "Inputs(" + k + ")='" + transicao.entradas[j][k] + "'";
                                hasIf = true;
                            }
                            if (hasIf) texto += " THEN\n\t";
                            if (diagrama.saidaMealy) {
                                texto += "\t\t\tMealy <= \"" + transicao.saidas[j].join('') + "\";\n";
                                if (hasIf) texto += "\t";
                            }
                            texto += "\t\t\tNEXT_STATE <= " + transicao.para.id + ";\n";
                            if (hasIf) { texto += "\t\t\tEND IF;\n"; hasIf = false; }
                        }
                    }
                }
                texto += "\n";
            }
            texto += "\tend process;\n\n";
            texto += "\tsync: process\n";
            texto += "\tbegin\n";
            texto += "\t\tif RST='1' then\n";
            texto += "\t\t\t" + ((diagrama.estadoInicial) ? ("\t\t\tCURRENT_STATE <= " + diagrama.estadoInicial.id + ";\n") : "-- Essa maquina não possui um estado inicial\n");
            texto += "\t\telsif rising_edge(CLOCK) then\n";
            texto += "\t\t\tCURRENT_STATE <= NEXT_STATE;\n";
            texto += "\t\tend if;\n";
            texto += "\tend process;\n";
            texto += "end behavior;";
        }

    }

    $area.val(texto);
}

var NomeEstados = function (diagrama) {
    var nomes = [];
    for (var i = 0; i < diagrama.estados.length; i++) {
        nomes.push(diagrama.estados[i].id);
    }
    return nomes;
}