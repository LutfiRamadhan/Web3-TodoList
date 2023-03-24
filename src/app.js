App = {
    loading: false,
    contracts: {},
    todoList: {},
    account: '',
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },
    
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        } else {
        window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            await ethereum.send('eth_requestAccounts')
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
        } catch (error) {
            // User denied account access...
        }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.send({/* ... */})
        }
        // Non-dapp browsers...
        else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // Set the current blockchain account
        App.account = await web3.eth.getAccounts()
        web3.eth.defaultAccount = App.account[0]
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed()
    },

    render: async () => {
        if (App.loading) {
            return
        }

        App.SetLoading(true);
        $('#account').html(App.account);
        await App.renderTask();
        App.SetLoading(false);
    },

    renderTask: async () => {
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')
        for (var i = 1; i <= taskCount; i++) {
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                            .prop('name', taskId)
                            .prop('checked', taskCompleted)
                            .on('click', App.toggleCompleted)

            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            $newTaskTemplate.show()
        }
    },

    SetLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        }
        else {
            loader.hide();
            content.show();
        }
    },

    createTask: async () => {
        App.SetLoading(true);
        const content = $('#newTask').val();
        console.log(App.account)
        await App.todoList.createTask(content, { from: App.account[0] });
        window.location.reload();
    },

    toggleCompleted: async (e) => {
        App.SetLoading(true);
        const taskId = e.target.name;
        await App.todoList.toggleCompleted(taskId, { from: App.account[0] });
        window.location.reload();
    }
}
$(() => {
    $(window).load(() => {
        App.load()
    })
})