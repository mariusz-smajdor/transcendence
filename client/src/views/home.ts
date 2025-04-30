export default function Home() {
	const container = document.createElement('div');
	container.innerHTML = `
		<h1>Welcome to the Home Page</h1>
		<p>This is the home page of your application.</p>
	`;

	return container;
}
