//Scripts Reutilizaveis
//import $ from "jquery";

const oldShowHide = {'show': $.fn.show, 'hide': $.fn.hide};
    
const messages = {
    "cpfTerceiroInvalido": "CPF inválido",
    "usuarioNaoEncontrado": "Usuário não encontrado",
    "falhaRequisicao": "Não foi possível completar a requisição, tente novamente.",
    "falhaProcessamento": "Ocorreu um erro no processamento da requisicao."
};

$.fn.extend({
    /* Bootstrap/Jquery show fix */
    show: function() {
        this.each(function(index){
            if ($(this).hasClass("d-none")) {
                $(this).removeClass("d-none");
            }
        });
        return oldShowHide.show.call(this);
    },

    /* Bootstrap/Jquery hide fix */
    hide: function() {
        this.each(function(index){
            if (!$(this).hasClass("d-none")){
                $(this).addClass("d-none");
            }
        });
        return oldShowHide.hide.call(this);
    }
});

$.fn.clearInputText = function() {
    $(this).val("");
    $(this).removeClass("is-valid is-invalid is-valid-outbase");
    $(this).next("div").removeClass("valid-feedback-outbase");
};

function isCPF(cpf){
    let soma = 0;
    let resto = 0;

    cpf = cpf.replace(/[\s.-]*/igm,"");

    if (cpf.length < 11) return false;

    if (cpf == "00000000000") return false;

    for (i=1; i<=9; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto == 10) || (resto == 11))  resto = 0;
    if (resto != parseInt(cpf.substring(9, 10)) ) return false;

    soma = 0;
    for (i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto == 10) || (resto == 11))  resto = 0;
    if (resto != parseInt(cpf.substring(10, 11) ) ) return false;

    return true;
}

function isEmail(email){
    const emailRules = /^([a-z]){1,}([a-z0-9._-]){1,}([@]){1}([a-z]){2,}([.]){1}([a-z]){2,}([.]?){1}([a-z]?){2,}$/i;

    return emailRules.test(email);
}

function isCEP(cep){
    const cepRules = /^[0-9]{5}-[0-9]{3}$/g;

    return cepRules.test(cep);
}

function isRG(rg){
    const rgRules = /^[0-9]{1,}$/g;

    return rgRules.test(rg);
}

function isDate(date){
    const dateRules = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)[0-9][0-9]$/g;
    const testedDate = dateRules.test(date);

    return testedDate;
}

function removeSpecialChars(string){
    return string
        .replace(/[ÀÁÂÃÄÅ]/g,"A")
        .replace(/[àáâãäå]/g,"a")
        .replace(/[ÈÉÊË]/g,"E")
        .replace(/[èéêë]/g,"e")
        .replace(/[òóôõ]/g,"I")
        .replace(/[òóôõ]/g,"i")
        .replace(/[ÒÓÔÕÖ]/g,"O")
        .replace(/[òóôõö]/g,"o")
        .replace(/[ÙÚÛÜ]/g,"U")
        .replace(/[ùúûü]/g,"u")
        .replace(/[Ç]/g,"C")
        .replace(/[ç]/g,"c");
}

// inicializacao das variaveis globais nao reutilizaveis
let tipoUsuario = "";
let terceiroNovo = false;
let confirmacaoAviso = "";
let acesso = "";
let tipoAcesso = "";
let perfilAcesso = "";
let papel = "";
let nomeResponsavel = "";
let numeroPessoaFisicaResponsavel = "";
let cpfUsuarioModelo = "";
let loginUsuarioModelo = "";
let codigoEmpresaUsuarioModelo = "";
let numeroInternoUsuarioModelo = "";
let loginColaborador = "";

//Scripts dos Modais
/*  Modal Colaboradores */


function httpGetModalColaboradores(pagina){

    $.get("`bmurl('regemp45x.htm')`", {
        "servico" : "buscarColaboradores",
        "tamanhoPagina": $("input[name=numeroItensPesquisaUsuario]").val(),
        "pagina": pagina,
        "tipoBusca": $("input[name=tipoPesquisaUsuario]:checked").val(),
        "termoBusca": $("input[name=pesquisaUsuario]").val(),
        "responsavel": false
    })
    .done(function(result) {
        if($.isEmptyObject(result.dados.colaboradores)){
            $("#pagina_posterior_modal_colaboradores").addClass("disabled");
            $("#pagina_anterior_modal_colaboradores").addClass("disabled");

            return false;
        }

        if(result.dados.colaboradores[0]['matricula'] == 0){
            $("#lista_colaboradores").hide();
            $("#divFotterColaborador").hide().removeClass("d-flex");
            $("#box_sem_dados_colaborador").find(".card-body").text("Sua busca não retornou resultados, tente novamente.");
            $("#box_sem_dados_colaborador").show();
        }
        else{
            $("#lista_colaboradores").show();
            $("#divFotterColaborador").show().addClass("d-flex");
            $("#box_sem_dados_colaborador").hide();
        }

        $("#pagina_atual_modal_colaboradores").text(pagina);
        const existeProximaPaginacao = result.dados.colaboradores[0]['tem-proximo'];

        pagina > 1
            ? $("#pagina_anterior_modal_colaboradores").removeClass("disabled")
            : $("#pagina_anterior_modal_colaboradores").addClass("disabled");

        existeProximaPaginacao === true
            ? $("#pagina_posterior_modal_colaboradores").removeClass("disabled")
            : $("#pagina_posterior_modal_colaboradores").addClass("disabled");

        $("#lista_colaboradores tbody").empty();

        $.each(result.dados.colaboradores, function(index, colaborador) {

            $("#lista_colaboradores tbody").append(
                "<tr class='d-flex js-lista-colaboradores'>" +
                    "<td class='col-7' title='" + colaborador.email + "'>" + colaborador.nome + "</td>" +
                    "<td class='col-3'>" + colaborador.cpf + "</td>" +
                    "<td class='col-2' data-login='" + colaborador.login + "'>" + colaborador.matricula + "</td>" +
                "</tr>"
            );
        });

        $(".js-lista-colaboradores").click(function(){
            $("input[name='nomeColaborador']").val($(this).find('td:first-child').text());
            $("input[name='emailColaborador']").val($(this).find('td:first-child').attr('title'));
            $("input[name='cpfColaborador']").val($(this).children('td').eq(1).text());

            loginColaborador = $(this).children('td').eq(2).attr("data-login");

            $("#btn_colaborador").hide();
            $("#box_colaborador_selecionado").show();
            $(this).handleButtonModelo(tipoUsuario);
        });
    })
    .fail(function(result) {
        $("#pagina_posterior_modal_colaboradores").addClass('disabled');
        $("#pagina_anterior_modal_colaboradores").addClass('disabled');
    });
};

$("#btn_colaborador").click(function(){
    const pagina = 1;

    $("input[name=pesquisaUsuario]").val("");
    httpGetModalColaboradores(pagina);
});

$("#pagina_anterior_modal_colaboradores").click(function(){

    if($(this).hasClass("disabled")){
        return false;
    }

    const pagina = Number($("#pagina_atual_modal_colaboradores").text()) - 1;

    httpGetModalColaboradores(pagina);
});

$("#pagina_posterior_modal_colaboradores").click(function(){

    if($(this).hasClass("disabled")){
        return false;
    }

    const pagina = Number($("#pagina_atual_modal_colaboradores").text()) + 1;

    httpGetModalColaboradores(pagina);
});

$("#btn_pesquisar_colaborador").click(function(){
    const pagina = 1;

    httpGetModalColaboradores(pagina);
});

$("#btn_alterar_responsavel").click(function(){
    const pagina = 1;

    $("input[name=pesquisaResponsavel]").val("");
    httpGetModalResponsaveis(pagina);
});

$("#btn_responsavel").click(function(){
    const pagina = 1;

    $("input[name=pesquisaResponsavel]").val("");
    httpGetModalResponsaveis(pagina);
});

$("#pagina_anterior_modal_responsaveis").click(function(){

    if($(this).hasClass("disabled")){
        return false;
    }

    const pagina = Number($("#pagina_atual_modal_responsaveis").text()) - 1;

    httpGetModalResponsaveis(pagina);
});

$("#pagina_posterior_modal_responsaveis").click(function(){

    if($(this).hasClass("disabled")){
        return false;
    }

    const pagina = Number($("#pagina_atual_modal_responsaveis").text()) + 1;

    httpGetModalResponsaveis(pagina);
});

/* Modal Responsaveis */
$("#btn_pesquisar_responsavel").click(function(){
    const pagina = 1;

    httpGetModalResponsaveis(pagina);
});

function httpGetModalResponsaveis(pagina){

    $.get("`bmurl('regemp45x.htm')`", {
        "servico" : "buscarColaboradores",
        "tamanhoPagina": $("input[name=numeroItensPesquisaResponsavel]").val(),
        "pagina": pagina,
        "tipoBusca": $("input[name=tipoPesquisaResponsavel]:checked").val(),
        "termoBusca": $("input[name=pesquisaResponsavel]").val(),
        "responsavel": true
    })
    .done(function(result) {
        if($.isEmptyObject(result.dados.colaboradores)){
            $("#pagina_posterior_modal_responsaveis").addClass("disabled");
            $("#pagina_anterior_modal_responsaveis").addClass("disabled");

            return false;
        }

        if(result.dados.colaboradores[0]['matricula'] == 0){
            $("#lista_responsaveis").hide();
            $("#divFotterResponsavel").hide().removeClass("d-flex");
            $("#box_sem_dados_responsavel").find(".card-body").text("Sua busca não retornou resultados, tente novamente.");
            $("#box_sem_dados_responsavel").show();
        }
        else{
            $("#lista_responsaveis").show();
            $("#divFotterResponsavel").show().addClass("d-flex");
            $("#box_sem_dados_responsavel").hide();
        }

        $("#pagina_atual_modal_responsaveis").text(pagina);
        const existeProximaPaginacao = result.dados.colaboradores[0]['tem-proximo'];

        pagina > 1
            ? $("#pagina_anterior_modal_responsaveis").removeClass("disabled")
            : $("#pagina_anterior_modal_responsaveis").addClass("disabled");

        existeProximaPaginacao === true
            ? $("#pagina_posterior_modal_responsaveis").removeClass("disabled")
            : $("#pagina_posterior_modal_responsaveis").addClass("disabled");

        $("#lista_responsaveis tbody").empty();

        $.each(result.dados.colaboradores, function(index, colaborador) {

            $("#lista_responsaveis tbody").append(
                "<tr class='d-flex js-lista-responsaveis'>" +
                    "<td class='col-7' data-email='" + colaborador.email + "'>" + colaborador.nome + "</td>" +
                    "<td class='col-3'>" + colaborador.cpf + "</td>" +
                    "<td class='col-2' data-pfisica-num='" + colaborador.numeroPessoaFisica + "'>" + colaborador.matricula + "</td>" +
                "</tr>"
            );
        });

        $(".js-lista-responsaveis").click(function(){

            nomeResponsavel = $(this).find("td:first-child").text();
            numeroPessoaFisicaResponsavel = $(this).children("td").eq(2).attr("data-pfisica-num");

            $("input[name='nomeResponsavel']").val(nomeResponsavel);
            $("input[name='emailResponsavel']").val($(this).find("td:first-child").attr("data-email"));
            $("input[name='cpfResponsavel']").val($(this).children("td").eq(1).text());
            $("input[name='nomeResponsavelexiste']").val(nomeResponsavel);
            $("input[name='emailResponsavelexiste']").val($(this).find("td:first-child").attr("data-email"));
            $("input[name='cpfResponsavelexiste']").val($(this).children("td").eq(1).text());

            $("#box_responsavel").find("h5").text("Responsável Selecionado");
            $("#card_responsavel_selecionado").show();
            $("#btn_responsavel").hide();
            $(this).handleButtonModelo(tipoUsuario);

        });
    })
    .fail(function(result) {
        $("#pagina_posterior_modal_responsaveis").addClass('disabled');
        $("#pagina_anterior_modal_responsaveis").addClass('disabled');
    });
};

//Scripts em comum com as Tabs
/* EVENTOS */
$("#nav-usuario-tab").click(function() {
    $("#btn_liberar_acesso").hide();
    $("#btn_usuario").hide();
    $("#btn_modelo").fadeIn(1000).show();
});

$("#nav-modelo-tab").click(function() {
    $("#btn_modelo").hide();
    $("#btn_liberar_acesso").show();
    $("#btn_usuario").fadeIn(1000).show();

    if ($("input[name=idPapel]").val()) {
        $("#btn_liberar_acesso").fadeIn(1000).show();
    }
});

$("#btn_cancelar").click(function(){
    window.location = $(this).val();
});

/* FUNCOES */
$.fn.handleButton = function(state, cssClass){
    if(state === true){
        $(this).prop("disabled", false);
        $(this).addClass(cssClass);
    } else {
        $(this).prop("disabled", true);
        $(this).removeClass(cssClass);
    }
};

// Fix para os casos onde o botao que possui tooltip esta desabilitado.
$.fn.handleTooltipButton = function(status, btnTooltip) {
    const pointerEventsValue = status == "disable" ? "all" : "none";

    $(this).tooltip(status);
    $(btnTooltip).css("pointer-events", pointerEventsValue);
};

$.fn.handleButtonModelo = function(tipoUsuario){

    const emailColaborador = $("input[name='emailColaborador']").val();
    const emailTerceiro = $("input[name='emailTerceiro']").val();
    const emailResponsavel = $("input[name='emailResponsavel']").val();

    switch(tipoUsuario) {
        case "colaborador":

            if(!isEmail(emailColaborador)){
                $("input[name='emailColaborador']").addClass("is-invalid");
                $("#tooltip_btn_modelo").handleTooltipButton("enable", "#btn_modelo");
                $("#btn_modelo").handleButton(false, "btn-primary");

                return false;
            }

            $("input[name='emailColaborador']").removeClass("is-invalid");

            break;

        case "terceiro":

            if(!isEmail(emailTerceiro)){
                $("input[name='emailTerceiro']").addClass("is-invalid");
                $("#btn_modelo").handleButton(false, "btn-primary");
                return false;
            }
            else
                $("input[name='emailTerceiro']").removeClass("is-invalid");


            break;

        case "terceiroNovo":
            responsavelSelecionado = ($("input[name='cpfResponsavel']").val() != "");
            isValidCadastroTercerio = $(this).validateCadastroTerceiro();

            if(!isValidCadastroTercerio || !responsavelSelecionado){

                $("#tooltip_btn_modelo").handleTooltipButton("enable", "#btn_modelo");
                $("#btn_modelo").handleButton(false, "btn-primary");

                return false;
            }

            break;
    }

    $("#tooltip_btn_modelo").handleTooltipButton("disable", "#btn_modelo");
    $("#btn_modelo").handleButton(true, "btn-primary");
};

$.fn.resetSectionFooter = function() {
    switch($(this).attr('id')) {
        case "screen_usuario":
            $("#btn_modelo").handleButton(false, "btn-primary");
            $("#tooltip_btn_modelo").handleTooltipButton("disable", "#btn_modelo");
            $("#btn_usuario").hide();
            break;

        case "screen_modelo":
            break;
    }
};

//Scripts Tab Usuario

/* MASCARAS */
$("input[name=cpfSelecaoTerceiro]").mask("000.000.000-00");
$("#rg_terceiro_novo").mask("999999999999");
$("#nascimento_terceiro_novo").mask("99/99/9999");
$("#cep_terceiro_novo").mask("99999-999");

/* EVENTOS */
$("#nav-usuario-tab").click(function() {
    $("#btn_liberar_acesso").hide();
    $("#btn_usuario").hide();
    $("#btn_modelo").fadeIn(1000).show();
});

$(".js-selecao-tipo-usuario").click(function() {

    if ($("#box_colaborador_selecionado").is(":visible") && $(this).attr("id") == "card_colaborador"
        || $("#section_terceiro").is(":visible") && $(this).attr("id") == "card_terceiro"){
        return false;
    }

    $("#screen_modelo").resetScreenModelo();
    $("#screen_usuario").resetScreenUsuario();


    if($(this).attr("id") == "card_colaborador"){
        tipoUsuario = "colaborador";

        $("#section_colaborador").show();
        $("#btn_colaborador").show();

    } else if($(this).attr("id") == "card_terceiro") {
        tipoUsuario = "terceiro";

        $("#section_terceiro").show();
        $("#btn_colaborador").hide();
        $("#cpfSelecaoTerceiro").focus();
    }

    $(this).addClass('is-clicked');
    $(this).find("h4").addClass("is-clicked");
    $(this).find("input").prop("checked", "checked");
});

$("#btn_alterar_colaborador").click(function() {
    $("#screen_modelo").resetScreenModelo();
    const pagina = 1;

    $("input[name=pesquisaUsuario]").val("");
    httpGetModalColaboradores(pagina);
});


$("#btn_modelo").click(function() {
    $("#nav-modelo-tab").removeClass("disabled");
    $("#nav-modelo-tab").tab("show");

    $("#btn_modelo").hide();

    $("#btn_usuario").handleButton(false, "btn-outline-primary");
    $("#btn_usuario").show();

    $("#step_usuario").hide();
    $("#step_modelo").show();

    $("#btn_liberar_acesso").show();
    $("#btn_usuario").handleButton(true, "btn-outline-primary");


    if($("input[name=idPapel]").val() != ""){
        $("#btn_liberar_acesso").handleButton(true, "btn-success");
    } else {
        $.fn.httpGetTiposAcesso();
        //removerEntregaMajor();
    }
});

$("input[name=cpfSelecaoTerceiro]").bind("paste", function() {
     $(this).handleCpfTerceiro();
});

$("input[name=cpfSelecaoTerceiro]").keyup(function() {
    $(this).handleCpfTerceiro();
});

$("#btn_alterar_cpf_terceiro").click(function() {
    $("#tooltip_btn_modelo").handleTooltipButton("disable", "#btn_modelo");
    $("#btn_modelo").handleButton(false, "btn-primary");
    $("#card_terceiro_selecionado").hide();

    $("input[name=nomeTerceiro]").val("");
    $("input[name=cpfTerceiro]").val("");
    $("input[name=emailTerceiro]").val("");

    $("input[name=cpfSelecaoTerceiro]").val("").focus().removeClass("is-valid");
});

$(".form-cadastro-terceiro").blur(function(){
    $(this).handleButtonModelo("terceiroNovo");
});

$("input[name=emailColaborador]").change(function() {
    $(this).handleButtonModelo("colaborador");
});

$("input[name=emailTerceiro]").change(function() {
    $(this).handleButtonModelo("terceiro");
});

/* FUNCOES */
$.fn.resetScreenUsuario = function() {
    $("#nav-modelo-tab").addClass("disabled");
    $(this).resetSectionSelecaoTipoUsuario();
    $(this).resetSectionColaborador();
    $("#btn_responsavel").show();
    $(this).resetSectionTerceiro();
    $(this).resetSectionFooter();
};

$.fn.resetSectionSelecaoTipoUsuario = function() {
    $(this).find(".card-radio").removeClass('is-clicked');
    $(this).find(".card-radio").find("h4").removeClass('clicked');
};

$.fn.resetSectionColaborador = function() {
    $("#section_colaborador").hide();
    $("#box_colaborador_selecionado").hide();
};

$.fn.resetSectionTerceiro = function() {
    $("#section_terceiro").hide();
    $("#card_terceiro_selecionado").hide();
    $("#cadastro_terceiro").hide();
    $("input[name=cpfSelecaoTerceiro]").clearInputText();

    $.fn.resetResponsavel();
};

$.fn.resetResponsavel = function() {
    $("#box_responsavel").hide();
    $("#box_responsavel").find("h5").text("Responsável");
    $("#card_responsavel_selecionado").hide();
};

$.fn.handleMessagesCpfTerceiro = function(type, message) {
    switch(type) {
        case "Successo":
            $(this).addClass("is-valid");
            break;

        case "Aviso":
            $(this).addClass("is-invalid is-valid-outbase");
            $(this).next("div").addClass("valid-feedback-outbase");
            break;

        case "Erro":
            $(this).addClass("is-invalid");
            break;
    }

    $("#validation_feedback_cpf").text(message);
}

$.fn.handleCpfTerceiro = function() {
    const inputCpfTerceiro = $(this);
    const cpfTerceiro = $(this).val();

    $(this).removeClass("is-invalid is-valid is-valid-outbase");
    $(this).next("div").removeClass("valid-feedback-outbase");

    $("#cadastro_terceiro").hide();
    $("#card_terceiro_selecionado").hide();

    $("#btn_modelo").handleButton(false, "btn-primary");
    $("#tooltip_btn_modelo").handleTooltipButton("disable", "#btn_modelo");

    $.fn.resetResponsavel();

    if(!isCPF(cpfTerceiro)){
        if(cpfTerceiro.length == 14){
            $(this).addClass("is-invalid");
            $("#validation_feedback_cpf").text(messages.cpfTerceiroInvalido);
        }
        return false;
    }

    $.get("`bmurl('usuar38x.htm')`", {
        "servico" : "buscarUsuarioTerceiro",
        "cpf"  : cpfTerceiro
    })
        .done(function(result) {

            $("#btn_responsavel").show();

            if(!$.isEmptyObject(result.dsMensagens)){

                $.each(result.dsMensagens.ttMensagem, function(index, ttMensagem) {

                    if (ttMensagem.tipo == "Aviso"){

                        tipoUsuario = "terceiroNovo";
                        inputCpfTerceiro.handleMessagesCpfTerceiro("Aviso", ttMensagem.descricao);

                        $("#card_terceiro_selecionado").hide();

                        $("#cadastro_terceiro").show();
                        $("#box_responsavel").show();
                        $("#tooltip_btn_modelo").handleTooltipButton("enable", "#btn_modelo");
                    }

                    if (ttMensagem.tipo == "Erro"){
                        inputCpfTerceiro.handleMessagesCpfTerceiro("Erro", messages.falhaRequisicao);
                    }

                    return false;
                });

                return false;
            }

            if(!$.isEmptyObject(result.dsUsuarioTerceiro)){

                tipoUsuario = "terceiro";
                inputCpfTerceiro.handleMessagesCpfTerceiro("Successo");

                $("input[name=nomeTerceiro]").val(result.dsUsuarioTerceiro.ttTerceiro[0]["nome"]);
                $("input[name=cpfTerceiro]").val(result.dsUsuarioTerceiro.ttTerceiro[0]["cpf"]);
                $("input[name=emailTerceiro]").val(result.dsUsuarioTerceiro.ttTerceiro[0]["email"]);

                nomeResponsavel = result.dsUsuarioTerceiro.ttTerceiro[0]["nomeResp"];
                numeroPessoaFisicaResponsavel = result.dsUsuarioTerceiro.ttTerceiro[0]["PFisicaNumResp"];

                $("input[name='nomeResponsavelexiste']").val(nomeResponsavel);
                $("input[name='emailResponsavelexiste']").val(result.dsUsuarioTerceiro.ttTerceiro[0]["emailResp"]);
                $("input[name='cpfResponsavelexiste']").val(result.dsUsuarioTerceiro.ttTerceiro[0]["cpfResp"]);

                $("#card_terceiro_selecionado").show();
                $("#btn_modelo").handleButton(true, "btn-primary");

                return true;
            }

        })
        .fail(function() {
            inputCpfTerceiro.handleMessagesCpfTerceiro("Erro", messages.falhaRequisicao);
        });
};

$.fn.validateCadastroTerceiro = function(){

    switch($(this).attr("id")) {
        case "email_terceiro_novo":
            if(isEmail($("#email_terceiro_novo").val()) || $("#email_terceiro_novo").val() == ""){
                $("#email_terceiro_novo").removeClass("is-invalid");
            } else {
                $("#email_terceiro_novo").addClass("is-invalid");
                return false;
            }
            break;
        case "rg_terceiro_novo":
            if(isRG($("#rg_terceiro_novo").val()) || $("#rg_terceiro_novo").val() == ""){
                $("#rg_terceiro_novo").removeClass("is-invalid");
            } else {
                $("#rg_terceiro_novo").addClass("is-invalid");
                return false;
            }
            break;
        case "nascimento_terceiro_novo":
            if(isDate($("#nascimento_terceiro_novo").val()) || $("#nascimento_terceiro_novo").val() == ""){
                $("#nascimento_terceiro_novo").removeClass("is-invalid");
            } else {
                $("#nascimento_terceiro_novo").addClass("is-invalid");
                return false;
            }

            break;
        case "cep_terceiro_novo":
            if(isCEP($("#cep_terceiro_novo").val()) || $("#cep_terceiro_novo").val() == ""){
                $("#cep_terceiro_novo").removeClass("is-invalid");
            } else {
                $("#cep_terceiro_novo").addClass("is-invalid");
                return false;
            }
            break;
    }

    let isInvalidField = false;
    if(!(isEmail($("#email_terceiro_novo").val()) && isRG($("#rg_terceiro_novo").val()) && isDate($("#nascimento_terceiro_novo").val()) && isCEP($("#cep_terceiro_novo").val())))
        isInvalidField = true;

    const inputsCadastroTerceiro = $(".form-cadastro-terceiro");
    let inputNotFilled = false;

    inputsCadastroTerceiro.each(function(){
        const inputRequired = typeof $(this).attr("required") !== 'undefined' && $(this).attr("required") !== false;

        if(inputRequired && $(this).val() == ""){
            inputNotFilled = true;
            return false;
        }

    });

    if(inputNotFilled || isInvalidField){
        return false;
    };

    return true;
};

//Scripts Tab Modelo
/* EVENTOS */
$(".js-selecao-usuario-modelo").click(function() {
    $("#screen_modelo").resetScreenModelo();

    $(".js-selecao-usuario-modelo").css("cursor", "wait");
    $(".js-selecao-usuario-modelo").css("pointer-events", "none");

    if($(this).attr("id") == "card_papel_usuario"){
        $("input[name=pesquisaUsuarioModelo]").attr("placeholder", "Pesquisar pelo nome do Usuário");

    } else {
        $("input[name=pesquisaUsuarioModelo]").attr("placeholder", "Pesquisar pelo nome do Perfil de Acesso");
    }

    $("#pesquisa_papel_perfil").show().addClass("d-flex");
    $("#accordion_usuario_modelo").show();
    $("#paginacao_usuario_modelo").show().addClass("d-flex");

    $(this).addClass('is-clicked');
    $(this).find("h4").addClass("is-clicked");
    $(this).find("input").prop("checked", "checked");

    getUsuarioModelo(1);
});

$("input[name=idPapel]").bind('paste', function() {
    $("#id_variavel_papel_usuario").text($(this).val());
    $.fn.handleButtonLiberarAcesso();
});

$("input[name=idPapel]").keyup(function() {
    $("#id_variavel_papel_usuario").text($(this).val());
    $.fn.handleButtonLiberarAcesso();
});

$("input[name=confirmacaoAviso]").click(function() {
    $.fn.handleButtonLiberarAcesso();
});

$("#btn_usuario").click(function() {
    $("#nav-usuario-tab").tab("show");

    $(this).hide();
    $("#btn_liberar_acesso").hide();

    $("#btn_modelo").show();
});

$("#btn_remover_modelo").click(function() {
    $("#screen_modelo").resetScreenModelo();
    //removerEntregaMajor();
});

$("#pagina_anterior_papel_perfil").click(function(){

    if($(this).hasClass("disabled")){
            return false;
    }

    $("#box_modelo_selecionado").hide();
    $.fn.resetSectionNomePapel();
    $.fn.handleButtonLiberarAcesso();

    const pagina = Number($("#pagina_atual_papel_perfil").text()) - 1;

    getUsuarioModelo(pagina);
});

$("#pagina_posterior_papel_perfil").click(function(){

    if($(this).hasClass("disabled")){
            return false;
    }

    $("#box_modelo_selecionado").hide();
    $.fn.resetSectionNomePapel();
    $.fn.handleButtonLiberarAcesso();

    const pagina = Number($("#pagina_atual_papel_perfil").text()) + 1;

    getUsuarioModelo(pagina);
});


$("#btn_pesquisar_papel_perfil").click(function() {
    $(this).resetSectionModeloSelecionado();
    $(this).resetSectionNomePapel();
    $.fn.handleButtonLiberarAcesso();
    getUsuarioModelo(1);
});

$("#btn_liberar_acesso").click(function() {

    $("#mensagens_erro").hide();
    $(".js-lista-erros").empty();

    $("#mensagens_aviso").hide();
    $(".js-lista-aviso").empty();

    $("#btn_liberar_acesso").handleButton(false, "btn-success");

    const parametrosLiberarAcesso = getParametrosLiberarAcesso();
    httpGetLiberarAcesso(parametrosLiberarAcesso);
});

// FUNCOES
    function getCpfUsuario(tipoUsuario) {

        const cpfUsuario = tipoUsuario == "colaborador"
            ? $("input[name=cpfColaborador]").val()
            : $("input[name=cpfSelecaoTerceiro]").val();

        return cpfUsuario;
    }

    function httpGetLiberarAcesso(parametrosLiberarAcesso){

        let existeErro = false;
        let existeAviso = false;

        $(".js-lista-erros").empty();
        $(".js-lista-avisos").empty();

        $.get("`bmurl('usuar38x.htm')`", parametrosLiberarAcesso)
        .done(function(result) {

            if(!$.isEmptyObject(result.dsMensagens)){

                $.each(result.dsMensagens.ttMensagem, function(index, ttMensagem) {

                    if (ttMensagem.tipo == "Erro"){
                        existeErro = true;

                        $(".js-lista-erros").append("<li class='h6 font-weight-bold'>" + ttMensagem.descricao + ".</li>");
                    }

                    if (ttMensagem.tipo == "Aviso"){
                        existeAviso = true;

                        $(".js-lista-avisos").append("<li class='h6 font-weight-bold'>" + ttMensagem.descricao + ".</li>");
                    }

                });

                if (existeAviso){
                    $("#mensagens_aviso").show();
                }

                if(existeErro) {
                    $("#js_erros_texto").text("Ao tentar liberar o acesso para " + $("#id_variavel_papel_usuario").text() + ", os seguintes erros foram encontrados:");
                    $("#mensagens_erro").show();
                }

                $("#btn_liberar_acesso").handleButton(true, "btn-success");

                return false;
            }

            if($.isEmptyObject(result.dsLiberarAcesso.ttUsuarioAcessoLiberado)){
                $(".js-lista-erros").append("<li class='h6 font-weight-bold'>" + falhaProcessamento + "</li>");
            }

            $("header").hide();

            $("#btn_liberar_acesso").hide();
            $("#btn_cancelar").hide();
            $("#btn_usuario").hide();
            $("#btn_remover_modelo").hide();

            $("#screen_usuario").hide();
            $("#screen_modelo").hide();

            $("#nome_usuario_acesso_liberado").text(result.dsLiberarAcesso.ttUsuarioAcessoLiberado[0]["nome"]);
            $("#papel_usuario_acesso_liberado").text(result.dsLiberarAcesso.ttUsuarioAcessoLiberado[0]["papel"]);
            $("#email_usuario_acesso_liberado").text(result.dsLiberarAcesso.ttUsuarioAcessoLiberado[0]["email"]);

            if (result.dsLiberarAcesso.ttUsuarioAcessoLiberado[0]["enviouEmail"]){
                $("#info_email_enviado").show();
            }

            $("#screen_acesso_liberado").fadeIn(2000).show();
            $("#btn_voltar_administracao_acessos").fadeIn(2000).show();

            $("#box_modelo_selecionado").clone().prependTo("#box_modelo_selecionado_acesso_liberado");
        })
        .fail(function(result) {

            if($.isEmptyObject(result.dsMensagens)){
                $(".js-lista-erros").append("<li class='h6 font-weight-bold'>" + falhaProcessamento + "</li>");
            }

            $.each(result.dsMensagens.ttMensagem, function(index, ttMensagem) {
                $(".js-lista-erros").append("<li class='h6 font-weight-bold'>" + ttMensagem.descricao + "</li>");
            });

            $("#btn_liberar_acesso").handleButton(true, "btn-success");

        });
    }

    function getParametrosLiberarAcesso(){
        let parametros = {};

        const usuarioModelo = $("input[name=usuarioModelo]:checked").val();

        parametros = {
                "servico" : "liberarAcesso",
                "tipoUsuario" : tipoUsuario,
                "tipoAcesso" : tipoAcesso,
                "perfilAcesso" : perfilAcesso,
                "idPapelFixolUsuario" : $("#id_fixo_papel_usuario").text(),
                "idPapelVariavellUsuario" : $("#id_variavel_papel_usuario").text(),
                "confirmacaoAviso" : confirmacaoAviso
        };

        if(usuarioModelo == "papel_do_usuario"){
            parametros.codigoEmpresaUsuarioModelo = codigoEmpresaUsuarioModelo;
            parametros.numeroInternoUsuarioModelo = numeroInternoUsuarioModelo;
            parametros.loginUsuarioModelo = loginUsuarioModelo;
        }

        switch(tipoUsuario) {
            case "colaborador":

                parametros.cpf = $("input[name=cpfColaborador]").val();
                parametros.nome = $("input[name=nomeColaborador]").val();
                parametros.email = $("input[name=emailColaborador]").val();

                break;

            case "terceiro":

                parametros.nomeResponsavel = nomeResponsavel;
                parametros.numeroPessoaFisicaResponsavel = numeroPessoaFisicaResponsavel;

                parametros.cpf = $("input[name=cpfSelecaoTerceiro]").val();
                parametros.nome = $("input[name=nomeTerceiro]").val();
                parametros.email = $("input[name=emailTerceiro]").val();

                break;

            case "terceiroNovo":

                parametros.nomeResponsavel = nomeResponsavel;
                parametros.numeroPessoaFisicaResponsavel = numeroPessoaFisicaResponsavel;

                parametros.cpf = $("input[name=cpfSelecaoTerceiro]").val();
                parametros.nome = $("input[name=nomeTerceiroNovo]").val();
                parametros.email = $("input[name=emailTerceiroNovo]").val();

                parametros.rg = $("input[name=rgTerceiroNovo]").val();
                parametros.dataNascimento = $("input[name=nascimentoTerceiroNovo]").val();
                parametros.nomeMae = $("input[name=maeTerceiroNovo]").val();
                parametros.nomePai = $("input[name=paiTerceiroNovo]").val();
                parametros.cep = $("input[name=cepTerceiroNovo]").val();
                parametros.endereco = $("input[name=enderecoTerceiroNovo]").val();
                parametros.bairro = $("input[name=bairroTerceiroNovo]").val();
                parametros.cidade = $("input[name=cidadeTerceiroNovo]").val();
                parametros.estado = $("input[name=estadoTerceiroNovo]").val();
                parametros.pais = $("input[name=paisTerceiroNovo]").val();

                break;
        }

        return parametros;
    }

    function getUsuarioModelo(pagina){

        const tipoLista = $("#papel_usuario").is(":checked") ? "papel_usuario" : "perfil_acesso";

        httpGetUsuarioModelo(pagina, tipoLista);
    }

    $.fn.httpGetPrefixoPapel = function(cpfUsuario, nomePapelVariavel) {

        $.get("`bmurl('usuar38x.htm')`", {
            "servico" : "buscarPrefixoPapel",
            "cpf" : cpfUsuario,
            "nomePapelVariavel" : nomePapelVariavel,
            "loginColaborador" : tipoUsuario == "colaborador" ? loginColaborador : ""
        })
        .done(function(result) {

            if($.isEmptyObject(result.dsPrefixoPapel.ttPrefixoPapel)){
                console.log("isEmptyObject: result.dsPapel.ttPrefixoPapel"); // TODO
                return false;
            }

            const idPapelVariavel = result.dsPrefixoPapel.ttPrefixoPapel[0]["idVariavel"];

            $("#id_fixo_papel_usuario").text(result.dsPrefixoPapel.ttPrefixoPapel[0]["idFixo"]);
            $("#id_variavel_papel_usuario").text(idPapelVariavel);
            $("input[name=idPapel]").val(idPapelVariavel);

            result.dsPrefixoPapel.ttPrefixoPapel[0]["esconder"]
                ? $("#box_nome_papel").hide()
                : $("#box_nome_papel").show();


        })
        .fail(function(result) {
            console.log(messages.falhaRequisicao); // TODO
        })
        .always(function() {
            $("input[name=idPapel]").focus();

            $.fn.handleButtonLiberarAcesso();
        });
    };

    function getHtmlAccordionItem(index, nomeUsuario){

        let htmlAccordionItem = "";

        htmlAccordionItem += '<div class="card">';
        htmlAccordionItem += '    <div class="card-header p-0">';
        htmlAccordionItem += '        <h2 class="mb-0">';
        htmlAccordionItem += '            <button class="btn btn-link btn-block text-left text-decoration-none shadow-none" type="button" data-toggle="collapse" data-target="#collapse' + index + '" aria-expanded="true" aria-controls="collapse' + index + '">' + nomeUsuario +'</button>';
        htmlAccordionItem += '        </h2>';
        htmlAccordionItem += '    </div>';
        htmlAccordionItem += '    <div id="collapse' + index + '" class="collapse p-0" data-parent="#accordion_usuario_modelo">';
        htmlAccordionItem += '        <div class="card-body p-0">';
        htmlAccordionItem += '            <table class="table table-usuario-modelo p-0 m-0">';
        htmlAccordionItem += '                <thead class="pb-3">';
        htmlAccordionItem += '                    <tr>';
        htmlAccordionItem += '                        <td class="col-fixed"></td>';
        htmlAccordionItem += '                        <td style="width: 20rem;">Tipo de Acesso</td>';
        htmlAccordionItem += '                        <td>Papel</td>';
        htmlAccordionItem += '                        <td class="d-none">Perfil de Acesso</td>';
        htmlAccordionItem += '                    </tr>';
        htmlAccordionItem += '                </thead>';
        htmlAccordionItem += '                <tbody id="collapse_tbody_' + index + '"></tbody>';
        htmlAccordionItem += '             </table>';
        htmlAccordionItem += '        </div>';
        htmlAccordionItem += '    </div>';
        htmlAccordionItem += '</div>';

        return htmlAccordionItem;
    }

    function getHtmlSubItemAccordion(index, usuarioModelo){

        let htmlAccordionSubItem = "";

        htmlAccordionSubItem += '<tr class="js-lista-papel-usuario">';
        htmlAccordionSubItem += '    <td data-cpf="' + usuarioModelo.cpf + '" data-login="' + usuarioModelo.login + '" data-empresa="' + usuarioModelo.empresa + '" data-numero-interno="' + usuarioModelo.numeroInterno + '"  class="col-fixed"><input id="acesso_papel_' + index + '" type="radio" name="radioAcessoPapel" /></td>';
        htmlAccordionSubItem += '    <td style="width: 20rem;">' + usuarioModelo.tipoAcesso + '</td>';
        htmlAccordionSubItem += '    <td>' + usuarioModelo.login + '</td>';
        htmlAccordionSubItem += '    <td class="text-quaternary d-none">' + usuarioModelo.perfilAcesso + '</td>';
        htmlAccordionSubItem += '</tr>';

        return htmlAccordionSubItem;
    }

    function httpGetUsuarioModelo(pagina, tipoLista) {

        const termoBusca = $("input[name=pesquisaUsuarioModelo]").val();
        const tipoBusca = $("select[name=pesquisaAcesso]").val();
        const registrosPorpagina = 5;

        $("#box_sem_dados_papel_perfil").hide();
        $("#accordion_usuario_modelo").empty();

        $.get("`bmurl('usuar38x.htm')`", {
            "servico" : "buscarPapelUsuario",
            "pagina" : pagina,
            "registrosPorpagina" : registrosPorpagina,
            "tipoBusca" : tipoBusca == null ? "todos" : tipoBusca,
            "termoBusca" : termoBusca,
            "tipoUsuario" : tipoUsuario,
            "tipoLista" : tipoLista,
            "cpf": getCpfUsuario(tipoUsuario)
        })
        .done(function(result) {

            let flagUsuario = {};
            let indexUsuario = {};

            $(".js-selecao-usuario-modelo").css("cursor", "pointer");
            $(".js-selecao-usuario-modelo").css("pointer-events", "all");

            if(!$.isEmptyObject(result.dsMensagens)){
                $("#box_modelo_selecionado").hide();
                $("#box_nome_papel").hide();
                $("input[name=idPapel]").val("");
                $("input[name=confirmacaoAviso]").prop("checked", "");
                $.fn.handleButtonLiberarAcesso();

                $("#accordion_usuario_modelo").hide();
                $("#paginacao_usuario_modelo").hide().removeClass("d-flex");
                $("#box_sem_dados_papel_perfil").find(".card-body").text(result.dsMensagens.ttMensagem[0]["descricao"]);
                $("#box_sem_dados_papel_perfil").show();

                $("input[name=pesquisaUsuarioModelo]").focus();

                return false;
            }

            $("#pagina_atual_papel_perfil").text(pagina);

            const existeProximaPaginacao = !$.isEmptyObject(result.dsPapelUsuario.ttPaginacao);

            pagina > 1
                ? $("#pagina_anterior_papel_perfil").removeClass("disabled")
                : $("#pagina_anterior_papel_perfil").addClass("disabled");

            existeProximaPaginacao === true
                ? $("#pagina_posterior_papel_perfil").removeClass("disabled")
                : $("#pagina_posterior_papel_perfil").addClass("disabled");

            $.each(result.dsPapelUsuario.ttPapelUsuario, function(index, usuarioModelo) {

                if (!flagUsuario[usuarioModelo.nome]) {
                    flagUsuario[usuarioModelo.nome] = true;

                    indexUsuario = index;

                    $("#accordion_usuario_modelo").append(getHtmlAccordionItem(indexUsuario, usuarioModelo.nome));
                }

                $("#accordion_usuario_modelo").find("#collapse_tbody_" + indexUsuario).append(getHtmlSubItemAccordion(index, usuarioModelo));
            });

            $("#accordion_usuario_modelo").show();

            $("#btn_usuario").handleButton(true, "btn-outline-primary");

            $("#paginacao_usuario_modelo").show().addClass("d-flex");

            $(".js-lista-papel-usuario").click(function(){
                $(this).handleTrClickTableTipoUsuario();

                const cpfUsuario = getCpfUsuario(tipoUsuario);
                const papelModeloSelecionado = $(this).children('td').eq(2).text();

                cpfUsuarioModelo = $(this).children('td').eq(0).attr("data-cpf");

                loginUsuarioModelo = $(this).children('td').eq(0).attr("data-login");
                codigoEmpresaUsuarioModelo = $(this).children('td').eq(0).attr("data-empresa");
                numeroInternoUsuarioModelo = $(this).children('td').eq(0).attr("data-numero-interno");

                perfilAcesso = $(this).children('td').eq(3).text();
                tipoAcesso = $(this).children('td').eq(1).text();
                const nomePapelVariavel = removeSpecialChars(tipoAcesso);

                $("#label_nome_modelo_selecionado").hide();
                $("#coluna_perfil_acesso").hide();

                $("#label_tipo_acesso_modelo").text(tipoAcesso);
                $("#label_perfil_acesso_modelo").text(perfilAcesso);
                $("#label_papel_modelo").text(papelModeloSelecionado);

                //$("#coluna_perfil_acesso").show();
                $("#coluna_papel").show();

                $.fn.httpGetPrefixoPapel(cpfUsuario, nomePapelVariavel);
            });
        })
        .fail(function(result) {
            $("#table_perfil_acesso").hide();
            $("#paginacao_usuario_modelo").hide().removeClass("d-flex");
            $("#box_sem_dados_papel_perfil").find(".card-body").text(messages.falhaRequisicao);
            $("#box_sem_dados_papel_perfil").show();

            $(".js-selecao-usuario-modelo").css("cursor", "pointer");
            $(".js-selecao-usuario-modelo").css("pointer-events", "all");
        })
    }

    $.fn.resetSectionSelecaoUsuarioModelo = function() {
        $("input[name=usuarioModelo]").prop("checked", "");

        $(this).find(".card-radio").removeClass("is-clicked");
        $(this).find(".card-radio").find("h4").removeClass("is-clicked");

        $("#pesquisa_papel_perfil").hide().removeClass("d-flex");
        $("input[name=pesquisaUsuarioModelo]").val("");
        $("#box_sem_dados_papel_perfil").hide();
    }

    $.fn.resetSectionPapelUsuario = function() {
        $("#accordion_usuario_modelo").hide();
        $("#paginacao_usuario_modelo").hide().removeClass("d-flex");

        $(".table-usuario-modelo tbody").find(".is-selected").removeClass("is-selected");
        $(".table-usuario-modelo tbody").find("input").prop("checked", "");
    }

    $.fn.resetSectionPerfilAcesso = function() {
        $("#table_perfil_acesso").hide();
        $("#paginacao_usuario_modelo").hide().removeClass("d-flex");

        $(".table-usuario-modelo tbody").find(".is-selected").removeClass("is-selected");
        $(".table-usuario-modelo tbody").find("input").prop("checked", "");
    }

    $.fn.resetSectionNomePapel = function() {
        $("#box_nome_papel").hide();
        $("input[name=idPapel]").val("");
        $("input[name=confirmacaoAviso]").prop("checked", "");
    }

    $.fn.resetSectionUsuarioModelo = function() {
        $("#box_modelo_selecionado").hide();
        $("#box_sem_dados_papel_perfil").hide();
        $("#table_perfil_acesso tbody").empty();
        $.fn.resetSectionNomePapel();
        $.fn.resetSectionModeloSelecionado();
        $.fn.resetSectionPerfilAcesso();
        $.fn.handleButtonLiberarAcesso();
    };

    $.fn.resetSectionModeloSelecionado = function() {
        $("#box_modelo_selecionado").hide();
        $("#coluna_perfil_acesso").hide();
        $("#coluna_papel").hide();
    };

    $.fn.resetScreenModelo = function() {

        $(this).resetSectionSelecaoUsuarioModelo();
        $(this).resetSectionPapelUsuario();
        $(this).resetSectionPerfilAcesso();
        $(this).resetSectionModeloSelecionado();
        $(this).resetSectionNomePapel();
        $.fn.handleButtonLiberarAcesso();
        $.fn.resetAlertas();
    };

    $.fn.resetAlertas = function() {
        $("#mensagens_erro").hide();
        $("#mensagens_aviso").hide();
    };

    $.fn.handleTrClickTableTipoUsuario = function(){

        $(".table-usuario-modelo tbody tr").removeClass("is-selected");

        $(this).find("input").prop("checked", "checked");
        $(this).addClass("is-selected");

        $("#box_modelo_selecionado").show();
        $("#box_nome_papel").show();

        $("#btn_modelo").hide();
        $("#label_papel_modelo").text(papel);
    };

    $.fn.handleButtonLiberarAcesso = function(){
        confirmacaoAviso = $('input[name="confirmacaoAviso"]:checked').length > 0;
        const alertaAviso = $("#mensagens_aviso").is(":visible") ? true : false;
        const validacaoAlertaAviso = (!alertaAviso ? true : alertaAviso && confirmacaoAviso ? true : false);

        if (!$("input[name=idPapel]").val() || !validacaoAlertaAviso){
            $("#btn_liberar_acesso").handleButton(false, "btn-success");
            return false;
        }

        $("#btn_liberar_acesso").handleButton(true, "btn-success");
    };

    $.fn.httpGetTiposAcesso = function(pagina) {

        $('select[name=pesquisaAcesso]').empty();
        $('select[name=pesquisaAcesso]').append('<option value="todos" selected>Todos</option>');

        $.get("`bmurl('usuar38x.htm')`", {
            "servico" : "buscarTiposAcesso",
            "tipoUsuario" : tipoUsuario,
            "cpf": getCpfUsuario(tipoUsuario)
        })
        .done(function(result) {

            if(!$.isEmptyObject(result.dsMensagens)){
                $("#box_modelo_selecionado").hide();
                $("#box_nome_papel").hide();
                $("input[name=idPapel]").val("");
                $("input[name=confirmacaoAviso]").prop("checked", "");
                $.fn.handleButtonLiberarAcesso();

                $("#accordion_usuario_modelo").hide();
                $("#paginacao_usuario_modelo").hide().removeClass("d-flex");
                $("#box_sem_dados_papel_perfil").find(".card-body").text(result.dsMensagens.ttMensagem[0]["descricao"]);
                $("#box_sem_dados_papel_perfil").show();

                $("input[name=pesquisaUsuarioModelo]").focus();

                return false;
            }

            $.each(result.dsTiposAcesso.ttTiposAcesso, function(index, tipoAcesso) {
                $('select[name=pesquisaAcesso]').append("<option value='" + tipoAcesso.codigo + "'>" + tipoAcesso.nome + "</option>");
            });

        })
        .fail(function(result) {
            $("#table_perfil_acesso").hide();
            $("#paginacao_usuario_modelo").hide().removeClass("d-flex");
            $("#box_sem_dados_papel_perfil").find(".card-body").text(messages.falhaRequisicao);
            $("#box_sem_dados_papel_perfil").show();
        })
    };

//Scripts Tab* Acesso Liberado
$("#btn_voltar_administracao_acessos").click(function(){
    window.location = $(this).val();
});

// Removido da entrega da major, o trecho abaixo sera deletado na proxima minor.
function removerEntregaMajor(){
$("#screen_modelo").resetScreenModelo();
$("input[name=pesquisaUsuarioModelo]").attr("placeholder", "Pesquisar pelo nome do Usuário");
$("#pesquisa_papel_perfil").show().addClass("d-flex")
$("#accordion_usuario_modelo").show();
$("#paginacao_usuario_modelo").show().addClass("d-flex");

//$.fn.httpGetUsuarioModelo(1);

$("#card_papel_usuario").addClass('is-clicked');
$("#card_papel_usuario").find("h4").addClass("is-clicked");
$("#card_papel_usuario").find("input").prop("checked", "checked");

$("#pesquisa_papel_perfil").removeClass("mt-4");
$("#card_papel_usuario").hide();
$("#card_perfil_acesso").hide();
}
//Script OnReady
$(document).ready(function() {
    $("#pagina_copia_acessos").show();

    $("[data-toggle='tooltip']").tooltip();

    $("#tooltip_btn_modelo").handleTooltipButton("disable", "#btn_modelo");
    $("#btn_liberar_acesso").handleButton(false, "btn-success");
});