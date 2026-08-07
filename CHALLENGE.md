# Fullstack Test Project <img src="https://raw.githubusercontent.com/Coderockr/fullstack-test/refs/heads/main/coderockr.banner.svg" align="right" height="50px" />

You should see this challenge as an opportunity to create an application following modern development best practices (given the stack of your choice), but also feel free to use your own architecture preferences (coding standards, code organization, third-party libraries, etc). It’s perfectly fine to use vanilla code or any framework or libraries.

## Scope

In this challenge you should build a **fullstack application** (API + UI) for an application that stores and manages investments, it should have the following features:

### Backend (API)

1. __Creation__ of an investment with an owner, a creation date and an amount.
   1. The creation date of an investment can be today or a date in the past.
   2. An investment should not be or become negative.
2. __View__ of an investment with its initial amount and expected balance.
   1. Expected balance should be the sum of the invested amount and the [gains][].
   2. If an investment was already withdrawn then the balance must reflect the gains of that investment
3. __Withdrawal__ of a investment.
   1. The withdraw will always be the sum of the initial amount and its gains,
      partial withdrawn is not supported.
   2. The withdrawal date must be informmed by the user, and it can be a date in the past or today, but can't happen before the investment creation or the future.
   3. [Taxes][taxes] need to be applied to the withdrawals before showing the final value.
4. __List__ of a person's investments
   1. This list should have pagination.

### Frontend (UI)

1. __List__ of investments
   - Display all investments with basic information (owner, date, amount, current balance, status)
2. __View__ of a single investment
   - Display detailed information including gains and final balance
3. __Create__ investment form
   - Allow users to create a new investment
4. __Withdrawal__ action
   - Allow users to perform a withdrawal and visualize the final taxed amount

### Gain Calculation

The investment will pay 0.52% every month in the same day of the investment creation.

Given that the gain is paid every month, it should be treated as [compound gain][], which means that every new period (month) the amount gained will become part of the investment balance for the next payment.

### Taxation

When money is withdrawn, tax is triggered. Taxes apply only to the gain portion of the money withdrawn. For example, if the initial investment was 1000.00, the current balance is 1200.00, then the taxes will be applied to the 200.00.

The tax percentage changes according to the age of the investment:
* If it is less than one year old, the percentage will be 22.5% (tax = 45.00).
* If it is between one and two years old, the percentage will be 18.5% (tax = 37.00).
* If older than two years, the percentage will be 15% (tax = 30.00).

## Design Reference

Use the following Figma as a visual and structural reference for the frontend interface:

- Figma: https://www.figma.com/design/jkilpjx9Q6hZnnCBHZcAWG/Coderockr-Fullstack---Test?node-id=0-1&p=f&t=thQWSMxSHxCJTtAs-0
- Prototype: https://www.figma.com/proto/jkilpjx9Q6hZnnCBHZcAWG/Coderockr-Fullstack---Test?node-id=1-2&p=f&t=thQWSMxSHxCJTtAs-0&scaling=scale-down-width&content-scaling=fixed&page-id=0%3A1

__NOTE:__ The layout will be evaluated, but not strictly against the provided design. You can use it as a guideline for structure and organization. Feel free to be creative and enhance the interface with your own ideas, such as visual effects, animations, transitions between screens, and responsive behavior. You may also use UI libraries or create your own components.

## Requirements
1. Create project using any technology of your preference. It’s perfectly OK to use vanilla code or any framework or libraries;
2. Although you can use as many dependencies as you want, you should manage them wisely;
3. It is not necessary to send the notification emails, however, the code required for that would be welcome;
4. The API must be documented in some way.

## Deliverables
The project source code and dependencies should be made available in GitHub. Here are the steps you should follow:
1. Fork this repository to your GitHub account (create an account if you don't have one, you will need it working with us).
2. Create a "development" branch and commit the code to it. Do not push the code to the main branch.
3. Include a README file that describes:
   - Special build instructions, if any
   - List of third-party libraries used and short description of why/how they were used
   - A link to the API documentation.
4. Once the work is complete, create a pull request from "development" into "main" and send us the link.
5. Avoid using huge commits hiding your progress. Feel free to work on a branch and use `git rebase` to adjust your commits before submitting the final version.
6. Create a "screenshots" sub-folder and include at least two screenshots of the app.

## Coding Standards
When working on the project be as clean and consistent as possible.

## Project Deadline
Ideally you'd finish the test project in 5 days. It shouldn't take you longer than a entire week.

## Quality Assurance
Use the following checklist to ensure high quality of the project.

### General
- First of all, the application should run without errors.
- Are all requirements set above met?
- Is coding style consistent?
- The API is well documented?
- The API has unit tests?
- Is the backend and frontend deploy-independent?

## Submission
1. A link to the Github repository.
2. Briefly describe how you decided on the tools that you used.

## Have Fun Coding 🤘
- This challenge description is intentionally vague in some aspects, but if you need assistance feel free to ask for help.
- If any of the seems out of your current level, you may skip it, but remember to tell us about it in the pull request.

## Credits

This coding challenge was inspired on [kinvoapp/kinvo-back-end-test](https://github.com/kinvoapp/kinvo-back-end-test/blob/2f17d713de739e309d17a1a74a82c3fd0e66d128/README.md)

[gains]: #gain-calculation
[taxes]: #taxation
[interest]: #interest-calculation
[compound gain]: https://www.investopedia.com/terms/g/gain.asp
