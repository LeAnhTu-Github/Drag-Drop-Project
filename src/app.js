var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var _this = this;
// autobind decorator
function autobind(_, _2, descriptor) {
    var originalMethod = descriptor.value;
    var adjDescriptor = {
        configurable: true,
        get: function () {
            var boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
// ProjectInput Class
var ProjectInput = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _submitHandler_decorators;
    return _a = /** @class */ (function () {
            function ProjectInput() {
                this.templateElement = (__runInitializers(this, _instanceExtraInitializers), void 0);
                this.templateElement = document.getElementById('project-input');
                this.hostElement = document.getElementById('app');
                var importedNode = document.importNode(this.templateElement.content, true);
                this.element = importedNode.firstElementChild;
                this.element.id = 'user-input';
                this.titleInputElement = this.element.querySelector('#title');
                this.descriptionInputElement = this.element.querySelector('#description');
                this.peopleInputElement = this.element.querySelector('#people');
                this.configure();
                this.attach();
            }
            ProjectInput.prototype.gatherUserInput = function () {
                var enteredTitle = this.titleInputElement.value;
                var enteredDescription = this.descriptionInputElement.value;
                var enteredPeople = this.peopleInputElement.value;
                if (enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
                    alert('Invalid input, please try again!!');
                    return;
                }
                else {
                    return [enteredTitle, enteredDescription, +enteredPeople];
                }
            };
            ProjectInput.prototype.clearUserInput = function () {
                this.titleInputElement.value = '';
                this.descriptionInputElement.value = '';
                this.peopleInputElement.value = '';
            };
            ProjectInput.prototype.submitHandler = function (event) {
                event.preventDefault();
                var userInput = this.gatherUserInput();
                if (Array.isArray(userInput)) {
                    var title = userInput[0], description = userInput[1], people = userInput[2];
                    console.log('Title: ' + title);
                    console.log('Description: ' + description);
                    console.log('People: ' + people);
                }
                this.clearUserInput();
            };
            ProjectInput.prototype.configure = function () {
                this.element.addEventListener('submit', this.submitHandler);
            };
            ProjectInput.prototype.attach = function () {
                this.hostElement.insertAdjacentElement('afterbegin', this.element);
            };
            return ProjectInput;
        }()),
        (function () {
            _submitHandler_decorators = [autobind];
            __esDecorate(_a, null, _submitHandler_decorators, { kind: "method", name: "submitHandler", static: false, private: false, access: { has: function (obj) { return "submitHandler" in obj; }, get: function (obj) { return obj.submitHandler; } } }, null, _instanceExtraInitializers);
        })(),
        _a;
}();
var prjInput = new ProjectInput();
