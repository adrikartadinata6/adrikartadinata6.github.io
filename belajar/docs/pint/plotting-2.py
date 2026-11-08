import matplotlib.pyplot as plt
import numpy as np
import pint

ureg = pint.UnitRegistry()
ureg.setup_matplotlib(True)

y = np.linspace(0, 30) * ureg.miles
x = np.linspace(0, 5) * ureg.hours

fig, ax = plt.subplots()
ax.yaxis.set_units(ureg.inches)
ax.xaxis.set_units(ureg.seconds)

ax.plot(x, y, 'tab:blue')
ax.axhline(26400 * ureg.feet, color='tab:red')
ax.axvline(120 * ureg.minutes, color='tab:green')