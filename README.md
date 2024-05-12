# Rum Run

> List, search and run package.json scripts

## Usage

Running `rum` in a folder with a package.json file presents an overview of the available commands:

```shell
rum

> pnpm run dev
┌--------------┬--------------------------------┐
| 1 dev        | astro dev                      |
| 2 start      | astro dev                      |
| 3 build      | astro check && astro build     |
| 4 preview    | astro preview                  |
| 5 astro      | astro                          |
└--------------┴--------------------------------┘
```

* Type to search for a script by name or command
* ENTER to run the selected command
* ESC to clear the search
* ARROW UP/DOWN to navigate the list
* 1..9 to run the corresponding command
* CTRL+C to exit

## Cache

Figuring out the package manager of the project (npm, yarn, etc.) takes a while.
To speed things up, this is cached on the first run into `$HOME/.rumrun/$DIR_HASH`

Running `DEBUG=rum* rum` will show the cache folder.