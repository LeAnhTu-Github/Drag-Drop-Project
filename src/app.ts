// Drag - Drop Interface
interface Draggable {
	dragStartHandler(event: DragEvent): void;
	dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
	dragOverHandler(event: DragEvent): void;
	dropHandler(event: DragEvent): void;
	dragLeaveHandler(event: DragEvent): void;
}

// Project Type:
enum ProjectStatus {
	Active,
	Finished,
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public pepple: number,
		public status: ProjectStatus
	) {}
}

// Project State Management:
type Listener<T> = (items: T[]) => void;
// Custom Class State:
class State<T> {
	protected listeners: Listener<T>[] = [];
	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

class ProjectState extends State<Project> {
	private projects: Project[] = [];
	private static instance: ProjectState;
	private constructor() {
		super();
	}
	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addProject(title: string, description: string, numOfPeople: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			description,
			numOfPeople,
			ProjectStatus.Active
		);
		this.projects.push(newProject);
		this.updateListeners();
	}
	moveProject(projectId: string, newStatus: ProjectStatus) {
		const project = this.projects.find((prj) => prj.id === projectId);
		if (project && project.status !== newStatus) {
			project.status = newStatus;
			this.updateListeners();
		}
	}
	private updateListeners() {
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}

const prjState = ProjectState.getInstance();

// Validation:
interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}
function validate(validatableInput: Validatable) {
	let isValid = true;
	if (validatableInput.required) {
		isValid =
			isValid && validatableInput.value.toString().trim().length !== 0;
	}
	if (
		validatableInput.minLength != null &&
		typeof validatableInput.value === "string"
	) {
		isValid =
			isValid &&
			validatableInput.value.length >= validatableInput.minLength;
	}
	if (
		validatableInput.maxLength != null &&
		typeof validatableInput.value === "string"
	) {
		isValid =
			isValid &&
			validatableInput.value.length <= validatableInput.maxLength;
	}
	if (
		validatableInput.min != null &&
		typeof validatableInput.value === "number"
	) {
		isValid = isValid && validatableInput.value >= validatableInput.min;
	}
	if (
		validatableInput.max != null &&
		typeof validatableInput.value === "number"
	) {
		isValid = isValid && validatableInput.value <= validatableInput.max;
	}
	return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		},
	};
	return adjDescriptor;
}
// Component Base Class:
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;
	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(
			templateId
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as U;
		if (newElementId) {
			this.element.id = newElementId;
		}
		this.attach(insertAtStart);
	}
	private attach(insertAtBeginning: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtBeginning ? "afterbegin" : "beforeend",
			this.element
		);
	}

	abstract configure?(): void;
	abstract renderContent(): void;
}
// ProjectItem class:
class ProjectItem
	extends Component<HTMLUListElement, HTMLLIElement>
	implements Draggable
{
	private project: Project;

	get persons() {
		if (this.project.pepple === 1) {
			return "1 person";
		} else {
			return `${this.project.pepple} persons`;
		}
	}

	constructor(hostId: string, project: Project) {
		super("single-project", hostId, false, project.id);
		this.project = project;

		this.configure();
		this.renderContent();
	}
	@autobind
	dragStartHandler(event: DragEvent): void {
		event.dataTransfer!.setData("text/plain", this.project.id);
		event.dataTransfer!.effectAllowed = "move";
	}
	dragEndHandler(_: DragEvent): void {
		console.log("DragEnd");
	}
	configure(): void {
		this.element.addEventListener("dragstart", this.dragStartHandler);
		this.element.addEventListener("dragend", this.dragEndHandler);
	}
	renderContent() {
		this.element.querySelector("h2")!.textContent = this.project.title;
		this.element.querySelector("h3")!.textContent =
			this.persons + " assigned";
		this.element.querySelector("p")!.textContent = this.project.description;
	}
}

// ProjectList Class
class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProject: Project[] = [];

	constructor(private type: "active" | "finished") {
		super("project-list", "app", false, `${type}-projects`);

		this.configure();
		this.renderContent();
	}
	@autobind
	dragOverHandler(event: DragEvent): void {
		if (
			event.dataTransfer &&
			event.dataTransfer.types[0] === "text/plain"
		) {
			event.preventDefault();
			const listEl = this.element.querySelector("ul")!;
			listEl.classList.add("droppable");
		}
	}
	@autobind
	dropHandler(event: DragEvent): void {
		const prjId = event.dataTransfer!.getData("text/plain");
		prjState.moveProject(
			prjId,
			this.type === "active"
				? ProjectStatus.Active
				: ProjectStatus.Finished
		);
	}
	@autobind
	dragLeaveHandler(_: DragEvent): void {
		const listEl = this.element.querySelector("ul")!;
		listEl.classList.remove("droppable");
	}
	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`
		)! as HTMLUListElement;
		listEl.innerHTML = "";
		for (const prjItem of this.assignedProject) {
			new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
		}
	}
	configure() {
		this.element.addEventListener("dragover", this.dragOverHandler);
		this.element.addEventListener("dragleave", this.dragLeaveHandler);
		this.element.addEventListener("drop", this.dropHandler);

		prjState.addListener((projects: Project[]) => {
			const relevanProjects = projects.filter((prj) => {
				if (this.type === "active") {
					return prj.status === ProjectStatus.Active;
				}
				return prj.status === ProjectStatus.Finished;
			});
			this.assignedProject = relevanProjects;
			this.renderProjects();
		});
	}
	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector("h2")!.textContent =
			this.type.toUpperCase() + "PROJECTS";
	}
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

console.log("hello");

const prjInput = new ProjectInput();

const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");