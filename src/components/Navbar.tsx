import dayjs from "dayjs"
import { navIcons, navLinks } from "#constants"

const Navbar = () => {
    return (
        <nav>
          <div>
            <img src="/images/logo.svg" alt="logo" />
            <p className="text-xl font-bold">Pratham&apos;s Portfolio</p>

            <ul>
                {navLinks.map(({id, name}) => (
                  <li key={id}>
                    <p>{name}</p>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <ul>
              {navIcons.map(({id, img}) => (
                <li key={id}>
                  <img src={img} alt="" />
                </li>
              ))}
            </ul>

            <time dateTime="2025">{dayjs().format("ddd MMM D h:mm A")}</time>
          </div>
        </nav>
    )
}

export default Navbar