import { Component } from "./base-component.js";
import { DragTarget } from "../models/drag-drop.js";
import { autobind } from "../decorators/autobind.js";
import { Project, ProjectStatus } from "../models/project.js";
import { prjState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

// ProjectList Class
export class ProjectList
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
