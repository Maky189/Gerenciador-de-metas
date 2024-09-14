const { select, input, checkbox } = require("@inquirer/prompts");
const { parse } = require("path");

const fs = require("fs").promises;


let mensagem = "";

function mensagens(){
    console.clear();

    if (mensagem != ""){
        console.log(mensagem);
        mensagem = "";
    }
}

let metas

const carregar = async () => {
    try{
        const dados = await fs.readFile("metas.json", "utf-8");
        metas = JSON.parse(dados);
    }
    catch(erro){
        metas = [];
    }
}

const salvar = async () => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2));
}

const cadastrarmeta = async() => {
    
    const meta = await input({message: "Insira a meta: "});

    if (meta.length == 0) {
        mensagem = "a meta nao pode ser vazia";
        return cadastrarmeta;
    }

    metas.push({value: meta, checked: false});
}


const listarmetas = async() => {

    if (metas.length == 0){
        mensagem = "nao tem metas disponiveis ainda";
        return;
    }

    const realizadas = metas.filter((meta) => {
        return meta.checked;
    })

    if (realizadas.length == 0){
        mensagem = "Nao existem metas realizadas ainda";
        return;
    }

    await select({
        message: "metas realizadas: ",
        choices: [...realizadas]
    })
}

const listarmetas2 = async() => {

    if (metas.length == 0){
        mensagem = "nao existem metas ainda";
        return;
    }

    const nao_realizadas = metas.filter((meta) => {
        return !meta.checked;
    })

    if (nao_realizadas.length == 0){
        mensagem = "nao existem metas nao realizadas";
        return;
    }

    

    await select({
        message: "metas nao realizadas: ",
        choices: [...nao_realizadas]
    })
}

const realizarmeta = async () => {

    if (metas.length == 0){
        mensagem = "nao existem metas ainda";
        return;
    }


    const respostas = await checkbox({

        message: "Estas sao as metas disponiveis",
        instructions: false,
        choices: metas.copyWithin()

    })


    for (let i = 0; i < metas.length; i++)
    {
        metas[i].checked = false;
    }


    for (let i = 0; i < metas.length; i++){
        let flag = 0;
        for (let j = 0; j < respostas.length; j++){
            if (metas[i].value == respostas[j]){
                metas[i].checked = true;
                flag = 1;
                break;
            }  
        }
        console.log(metas[i].value + metas[i].checked)
        if (flag == 0){
            metas[i].checked = false;
        }
    }

} 

const removermeta = async() => {
    if (metas.length == 0){
        mensagem = "Nao tem nenhuma meta";
        return;
    }

    original = [];

    for (let i = 0; i < metas.length; i++)
    {
        original.push(metas[i]);
    }
    for (let i = 0; i < original.length; i++)
    {
        original[i].checked = false;
    }

    const removidas = await checkbox({
        message: "seleciona as metas que pretende remover",
        instructions: false,
        choices: [...original]
    })

    if (removidas.length == 0){
        mensagem = "nao foram removidas nenhumas metas";
        return;
    }

    let nova = [];
    
    for (let i = 0; i < metas.length; i++)
    {
        let flag = false;
        for(let j = 0; j < removidas.length; j++)
        {
            if (metas[i].value == removidas[j]){
                flag = true;
                break;
            }
        }

        if (!flag){
            nova.push(metas[i]);
        }
    }

    metas = nova;
}

const start = async () => {

    carregar()

    while (true) {

        mensagens();

        const option = await select ({

            message: "menu >",

            choices: [
                {
                    name: "Cadastrar meta",
                    value: "cadastrar"
                },

                {
                    name: "Lista de metas",
                    value: "listar"
                },

                {
                    name: "metas reaizadas",
                    value: "metas compridas",
                },

                {
                    name: "metas nao realizadas",
                    value: "metas nao compridas"
                },

                {
                    name: "remover metas",
                    value: "remover",
                },

                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })


        switch (option) {
            case "cadastrar":
                await cadastrarmeta();
                await salvar();
                break;
            
            case "listar":
                await realizarmeta();
                await salvar();
                break;

            case "metas compridas":
                await listarmetas();
                break;

            case "metas nao compridas":
                await listarmetas2();
                break;

            case "remover":
                await removermeta();
                await salvar();
                break;

            case "sair":
                console.log("Goodbye");
                return;
        }

    }

}

start()