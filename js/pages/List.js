import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";
import skillDescriptions from "../../data/skillsets.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">
<div
    class="selected-background"
:style="level ? {
    backgroundImage:
        'url(https://levelthumbs.prevter.me/thumbnail/' + level.id + '), url(/dog.png)'
} : {
    backgroundImage: 'url(/dog.png)'
}"

></div>

<div class="selected-background-overlay"></div>
            <div class="list-container">
<table class="list" v-if="list">
    <tr
        v-for="([level, err], i) in list"
        :key="i"
    >
        <td
            class="level"
            :class="{
                active: selected === i,
                error: !level
            }"
:style="level ? {
    backgroundImage:
        'url(https://levelthumbs.prevter.me/thumbnail/' + level.id + '), url(/dog.png)'
} : {
    backgroundImage: 'url(/dog.png)'
}"
        >
            <button @click="selected = i">

                <span class="rank">
                    <template v-if="i + 1 <= 150">
                        #{{ i + 1 }}
                    </template>

                    <template v-else>
                        Legacy
                    </template>
                </span>

                <span class="level-name">
                    {{ level?.name || 'Error (' + err + '.json)' }}
                </span>

            </button>
        </td>
    </tr>
</table>

            </div>

            <!-- LEVEL DETAILS -->
            <div class="level-container">

                <div class="level" v-if="level">

                    <h1>{{ level.name }}</h1>

                    <h2>
                        Published by {{ level.author }}
                    </h2>

                    <iframe
                        class="video"
                        id="videoframe"
                        :src="video"
                        frameborder="0"
                    ></iframe>

                    <!-- SKILLSET -->
                    <div
                        class="skillset"
                        v-if="level.skillset"
                    >
                        <span
                            v-for="skill in sortedSkillset"
                            :key="skill"
                            class="skill"
                        >
                            {{ skill }}

                            <span class="skill-tooltip">
                                {{ skillDescriptions[skill] }}
                            </span>
                        </span>
                    </div>

                    <!-- STATS -->
                    <ul class="stats">

                        <li>
                            <div class="type-title-sm">
                                ID
                            </div>
                            <p>
                                {{ level.id }}
                            </p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Tags
                            </div>
                            <p>
                                {{ level.tags }}
                            </p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Attempts
                            </div>
                            <p>
                                {{ level.attempts }}
                            </p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Difficulty Opinion
                            </div>
                            <p>
                                {{ level.difficulty }}
                            </p>
                        </li>

                    </ul>
                </div>

                <!-- NO LEVEL SELECTED -->
                <div
                    v-else
                    class="level"
                    style="
                        height: 100%;
                        justify-content: center;
                        align-items: center;
                    "
                >
                    <p>
                        (ノಠ益ಠ)ノ彡┻━┻
                    </p>
                </div>

            </div>

            <!-- META -->
            <div class="meta-container">

                <div class="meta">

                    <!-- ERRORS -->
                    <div
                        class="errors"
                        v-show="errors.length > 0"
                    >
                        <p
                            class="error"
                            v-for="error of errors"
                            :key="error"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- CREDIT -->
                    <div class="og">
                        <p class="type-label-md">
                            Website layout made by
                            <a
                                href="https://tsl.pages.dev/"
                                target="_blank"
                            >
                                TheShittyList
                            </a>
                        </p>
                    </div>

                    <!-- EDITORS -->
                    <template v-if="editors">

                        <h3>
                            List Editors
                        </h3>

                        <ol class="editors">

                            <li
                                v-for="editor in editors"
                                :key="editor.name"
                            >
                                <img
                                    :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`"
                                    :alt="editor.role"
                                >

                                <a
                                    v-if="editor.link"
                                    class="type-label-lg link"
                                    target="_blank"
                                    :href="editor.link"
                                >
                                    {{ editor.name }}
                                </a>

                                <p v-else>
                                    {{ editor.name }}
                                </p>

                            </li>

                        </ol>

                    </template>

                    <!-- NOTES -->
                    <h3>
                        Notes and info.
                    </h3>

                    <p>
                        Some demon levels ive beaten (poltergeist) I dont
                        have video recordings for so I just use a showcase.
                    </p>

                    <p>
                        The niche memes are mainstream.
                    </p>

                </div>

            </div>

        </main>
    `,

    data() {
        return {
            list: [],
            editors: [],
            loading: true,
            selected: 0,
            errors: [],
            roleIconMap,
            store,
            skillDescriptions,
            toggledShowcase: false,
        };
    },

    computed: {
        level() {
            return this.list?.[this.selected]?.[0] || null;
        },

            sortedSkillset() {
        if (!this.level?.skillset) {
            return [];
        }

        return [...this.level.skillset].sort((a, b) =>
            a.localeCompare(b)
        );
    },
        
        video() {
            if (!this.level) {
                return "";
            }

            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },

    async mounted() {
        // Fetch list
        this.list = await fetchList();

        // Fetch editors
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "wakeup picreator bro.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );

            if (!this.editors) {
                // this.errors.push("Failed to load list editors.");
                // I dont feel like removing editor list properly so fuck you
            }
        }

        this.loading = false;
    },

    methods: {
        embed,
        score,
    },
};
