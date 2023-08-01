import { Component } from "./base-component.js";
import { validate } from "../util/validation.js";
import { autobind } from "../decorators/autobind.js";
import { prjState } from "../state/project-state.js";

// ProjectInput Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		super("project-input", "app", true, "user-input");
		this.titleInputElement = this.element.querySelector(
			"#title"
		) as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			"#description"
		) as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			"#people"
		) as HTMLInputElement;
		this.configure();
	}
	configure() {
		this.element.addEventListener("submit", this.submitHandler);
	}
	renderContent(): void {}

	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPeople = this.peopleInputElement.value;
		// Create validate:
		const titleValidatable = {
			value: enteredTitle,
			required: true,
		};
		const descriptionValidatable = {
			value: enteredDescription,
			required: true,
			minLength: 5,
		};
		const peopleValidatable = {
			value: +enteredPeople,
			required: true,
			min: 1,
			max: 10,
		};

		if (
			!validate(titleValidatable) ||
			!validate(descriptionValidatable) ||
			!validate(peopleValidatable)
		) {
			alert("Invalid input, please try again!!");
			return;
		} else {
			return [enteredTitle, enteredDescription, +enteredPeople];
		}
	}
	private clearUserInput() {
		this.titleInputElement.value = "";
		this.descriptionInputElement.value = "";
		this.peopleInputElement.value = "";
	}
	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [title, description, people] = userInput;
			prjState.addProject(title, description, people);
			this.clearUserInput();
		}
	}
}
