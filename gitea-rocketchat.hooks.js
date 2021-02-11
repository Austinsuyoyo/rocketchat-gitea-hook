String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

const getAssigneesField = (assignees) => {
    let assigneesArray = [];
    assignees.forEach(function (assignee) {
        assigneesArray.push(assignee.login);
    });
    assigneesArray = assigneesArray.join(', ');
    return {
        title: 'Assignees',
        value: assigneesArray,
        short: assigneesArray.length <= 40
    };
};
const getLabelsField = (labels) => {
    let labelsArray = [];
    labels.forEach(function (label) {
        labelsArray.push(label.name);
    });
    labelsArray = labelsArray.join(', ');
    return {
        title: 'Labels',
        value: labelsArray,
        short: labelsArray.length <= 40
    };
};

const giteaEvents = {

    /* Create branch or tag */
    create(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const type = request.content.ref_type;
        const ref = request.content.ref;

        if (type == 'branch') {
            var text = 'Created branch **[' + ref + '](' + repo.html_url + '/src/branch/' + ref + ')** at [' + repo.full_name + '](' + repo.html_url + ')';
        } else if (type == 'tag') {
            var text = 'Created tags **[' + ref + '](' + repo.html_url + '/releases/tag/' + ref + ')** at [' + repo.full_name + '](' + repo.html_url + ')';
        }

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text
            }
        };
    },
    /* Delete Branch or tag */
    delete(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const type = request.content.ref_type;
        const ref = request.content.ref;
        if (type == 'branch') {
            var text = 'Deleted branch [' + ref + '](' + repo.html_url + '/src/branch/' + ref + ') at [' + repo.full_name + '](' + repo.html_url + ')';
        } else if (type == 'tag') {
            var text = 'Deleted tags [' + ref + '](' + repo.html_url + '/releases/tag/' + ref + ') at [' + repo.full_name + '](' + repo.html_url + ')';
        }

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text
            }
        };
    },

    /*  Someone forked repository */
    fork(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const forkee = request.content.forkee;
        const text = "Forked from **[" + forkee.full_name + '](' + forkee.html_url + ')** to **[' + repo.full_name + '](' + repo.html_url + ')**';
        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text
            }
        };
    },

    /* Push to repository */
    push(request) {
        const commits = request.content.commits;
        const user = request.content.sender;
        const repo = request.content.repository;
        const branch = request.content.ref.split('/').pop();

        const attachment = {
            collapsed: true,
            title: "Show " + commits.length + " commit",
            fields: []
        };

        for (var i = 0; i < commits.length; i++) {
            var commit = commits[i];
            var shortID = commit.id.substring(0, 7);
            output = '[#' + shortID + '](' + commit.url + '): \n' + commit.message
            attachment.fields.push({
                value: output,
            });
        }

        var text = 'Pushed to **[' + branch + '](' + repo.html_url + '/src/branch/' + branch + ")** at [" + repo.full_name + "](" + repo.html_url + "):"
            + "\n\n";


        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text,
                attachments: [attachment]
            }
        };
    },
    /* New/Modified issues */
    issues(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const is = request.content.issue;
        const action = request.content.action;

        if (action == "opened" || action == "reopened" || action == "edited") {
            var body = is.body;
        } else if (action == "label_updated" || action == "label_cleared") {
            var body = "Current labels: " + getLabelsField(is.labels).value;
        } else if (action == "assigned" || action == "unassigned") {
            if (is.assignee) {
                var body = "Current assignee: " + getAssigneesField(is.assignees).value;
            } else {
                var body = "There is no assignee";
            }
        } else if (action == "closed") {
            var body = "";
        } else if (action == "milestoned" || action == "demilestoned") {
            var body = "Milestone: [" + is.milestone.title + "](" + repo.html_url + "/milestone/" + is.milestone.id + ")";
        } else {
            return {
                error: {
                    success: false,
                    message: 'Unsupported issue action'
                }
            };
        }
        var text =
            action.capitalizeFirstLetter() + ' **[issue ​#' + is.number +
            ' - ' + is.title + '](' +
            is.html_url + ')** ' + 'at [' + repo.full_name + '](' + repo.html_url + ')\n\n';
        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text,
                attachments: [{
                    text: body
                }
                ]
            }
        };
    },

    /* Comment on existing issues or pull request*/
    issue_comment(request) {
        const user = request.content.comment.user;
        const repo = request.content.repository;
        const action = request.content.action;

        if (action == "created") {
            // Do nothing
        } else if (action == "edited") {
            // Do nothing
        } else if (action == "deleted") {
            // Do nothing
        } else {
            return {
                error: {
                    success: false,
                    message: 'Unsupported issue_comment action'
                }
            };
        }

        if (request.content.comment.pull_request_url) {
            var type = "pull request";
        } else if (request.content.comment.issue_url) {

            var type = "issue";
        } else {
            return {
                error: {
                    success: false,
                    message: 'Unsupported issue_comment action'
                }
            };
        }

        const text =
            action.capitalizeFirstLetter() + ' comment on **[' + type + ' ​#' + request.content.issue.number +
            ' - ' + request.content.issue.title + '](' +
            request.content.comment.html_url + ')**' + ' at [' + repo.full_name + '](' + repo.html_url + ')\n\n';


        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text,
                attachments: [
                    {
                        text: request.content.comment.body
                    }
                ]
            }
        };
    },

    /* New/Created pull request*/
    pull_request(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const pr = request.content.pull_request
        const action = request.content.action;

        if (action == "opened" || action == "reopened" || action == "edited" || action == "synchronize") {
            var body = pr.body;
        } else if (action == "label_updated" || action == "label_cleared") {
            var body = "Current labels: " + getLabelsField(pr.labels).value;
        } else if (action == "assigned" || action == "unassigned") {
            if (pr.assignee) {
                var body = "Current assignee: " + getAssigneesField(pr.assignees).value;
            } else {
                var body = "There is no assignee";
            }
        } else if (action == "closed") {
            if (pr.merged) {
                var body = "Merged by: " + pr.merged_by.login;
            }
        } else if (action == "milestoned" || action == "demilestoned") {
            var body = "Milestone: [" + pr.milestone.title + "](" + repo.html_url + "/milestone/" + pr.milestone.id + ")";
        } else {
            return {
                error: {
                    success: false,
                    message: 'Unsupported pull request action'
                }
            };
        }
        const text =
            action.capitalizeFirstLetter() + ' **[pull request ​#' + pr.number +
            ' - ' + pr.title + '](' +
            pr.html_url + ')**' + ' at [' + repo.full_name + '](' + repo.html_url + ')\n\n';

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text,
                attachments: [
                    {
                        text: body
                    }
                ]
            }
        };
    },

    /* Someone approved pull request */
    pull_request_approved(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const pr = request.content.pull_request

        var text = "Approved" + ' **[pull request ​#' + pr.number +
            ' - ' + pr.title + '](' +
            pr.html_url + ')**' + ' at [' + repo.full_name + '](' + repo.html_url + ')\n\n';

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text,
                attachments: [
                    {
                        text: request.content.review.content
                    }
                ]
            }
        };
    },
    /* Someone rejected pull request */
    pull_request_rejected(request) {
        const user = request.content.sender
        const repo = request.content.repository;;
        const pr = request.content.pull_request

        var text = "Suggested changes for" + ' **[pull request ​#' + pr.number +
            ' - ' + pr.title + '](' +
            pr.html_url + ')**' + ' at [' + repo.full_name + '](' + repo.html_url + ')\n\n';

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text,
                attachments: [
                    {
                        text: request.content.review.content
                    }
                ]
            }
        };
    },

    /* Deleted/Created Repository */
    repository(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const action = request.content.action;

        if (request.content.action == "deleted") {
            // Do nothing
        } else if (request.content.action == "created") {
            // Do nothing
        } else {
            return {
                error: {
                    success: false,
                    message: 'Unsupported issue action'
                }
            };
        }

        const text = action.capitalizeFirstLetter() + ' repository **[' + repo.full_name + '](' + repo.html_url + ')**';

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text
            }
        };
    },

    /* Published/Updated/Deleted release */
    release(request) {
        const user = request.content.sender;
        const repo = request.content.repository;
        const release = request.content.release;
        if (request.content.action == 'published') {
            var text = 'Release published "**[' + release.name + '](' + release.html_url + ')** at [' + repo.full_name + '](' + repo.html_url + ')';
        } else if (request.content.action == 'updated') {
            var text = 'Release updated  "**[' + release.name + '](' + release.html_url + ')** at [' + repo.full_name + '](' + repo.html_url + ')';
        } else if (request.content.action == 'deleted') {
            var text = 'Release deleted  "**[' + release.name + '](' + release.html_url + ')** at [' + repo.full_name + '](' + repo.html_url + ')';
        } else {
            return {
                error: {
                    success: false,
                    message: 'Unsupported release action'
                }
            };
        }

        return {
            content: {
                icon_url: user.avatar_url,
                alias: user.login,
                text: text
            }
        };
    },
};

class Script {
    process_incoming_request({ request }) {

        const header = request.headers['x-gitea-event'];
        if (giteaEvents[header]) {
            return giteaEvents[header](request);
        }

        return {
            error: {
                success: false,
                message: 'Unsupported method'
            }
        };
    }
}