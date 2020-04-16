(function () {
    function Service() {

        var functions = {};

        var FunctionFactory = function (functionName) {
            var fn = (function (name) {
                return function (component, data) {
                    return $A.getCallback(function () {
                        var promise = new Promise($A.getCallback(function (resolve, reject) {
                            function errorHandler(errors) {
                                var messages = [];

                                function getMessages(errorType) {
                                    var tempMessages = [];
                                    if (errorType.length) {
                                        errorType.forEach(function (errorEntry) {
                                            tempMessages.push(errorEntry.message);
                                        });
                                    } else {
                                        for (var prop in errorType) {
                                            errorType[prop].forEach(function (errorEntry) {
                                                tempMessages.push(errorEntry.message);
                                            });
                                        }
                                    }
                                    return tempMessages;
                                }

                                for (var err in errors) {
                                    if (errors[err].duplicateResults && errors[err].duplicateResults.length > 0) {
                                        messages = messages.concat(getMessages(errors[err].duplicateResults));
                                    }
                                    if (errors[err].pageErrors && errors[err].pageErrors.length > 0) {
                                        messages = messages.concat(getMessages(errors[err].pageErrors));
                                    }
                                    if (errors[err].fieldErrors && errors[err].fieldErrors.length > 0) {
                                        messages = messages.concat(getMessages(errors[err].fieldErrors));
                                    }
                                    if (errors[err].index && errors[err].index.length > 0) {
                                        messages = messages.concat(getMessages(errors[err].index));
                                    }
                                }
                                return messages;
                            }

                            var action;
                            try {
                                action = component.get('c.' + name);
                            } catch (exception) {
                                reject([exception.message]);
                                return;
                            }
                            if (data) {
                                action.setParams(data);
                            }
                            action.setCallback(false, function (returnObject) {
                                switch (returnObject.getState()) {
                                    case 'SUCCESS' :
                                        resolve(returnObject.getReturnValue());
                                        break;
                                    case 'ERROR':
                                    case 'FAILURE' :
                                        reject(errorHandler(returnObject.getError()));
                                        break;
                                    case 'INCOMPLETE' :
                                        reject(['Incomplete response from server!']);
                                        break;
                                    default :
                                        reject(['Unknown status code!']);
                                        break;
                                }
                            });
                            $A.enqueueAction(action, false);
                        }));
                        return promise;
                    })
                }
            })(functionName);
            return fn;
        };

        this.exec = function (functionName, component, data) {
            if (!functions[functionName]) {
                functions[functionName] = FunctionFactory(functionName);
            }
            return functions[functionName](component, data)();
        };

        this.execFactory = function (functionName, component) {
            if (!functions[functionName]) {
                functions[functionName] = FunctionFactory(functionName);
            }
            return function (data) {
                return functions[functionName](component, data)();
            }
        }
    }

    window.DataAccess = window.DataService = new Service();
})();